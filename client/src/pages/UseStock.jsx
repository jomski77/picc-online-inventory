import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Alert, Button, Label, Select, TextInput, Spinner } from 'flowbite-react';
import { apiGet, apiPost } from '../utils/apiConfig';

export default function UseStock() {
  const { currentUser } = useSelector((state) => state.user);
  const [formData, setFormData] = useState({
    item: '',
    quantity: 1,
  });
  const [items, setItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    const fetchAvailableItems = async () => {
      try {
        setLoading(true);
        const res = await apiGet('items');
        const data = await res.json();
        setItems(data);
        setLoading(false);
      } catch (error) {
        console.log(error);
        setLoading(false);
      }
    };
    fetchAvailableItems();
  }, []);

  useEffect(() => {
    if (formData.item) {
      const item = items.find((i) => i._id === formData.item);
      setSelectedItem(item);
    } else {
      setSelectedItem(null);
    }
  }, [formData.item, items]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.item) {
      return setError('Please select an item');
    }
    
    if (formData.quantity < 1) {
      return setError('Quantity must be at least 1');
    }
    
    if (selectedItem && selectedItem.currentStock < formData.quantity) {
      return setError(`Not enough stock available. Current stock: ${selectedItem.currentStock}`);
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const res = await apiPost('stockUsage', {
        item: formData.item,
        quantity: Number(formData.quantity),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        setError(data.message);
        setLoading(false);
        return;
      }
      
      setSuccess('Stock usage recorded successfully');
      
      // Refresh item list to update stock values
      const refreshRes = await apiGet('items');
      const refreshData = await refreshRes.json();
      setItems(refreshData);
      
      setFormData({
        item: '',
        quantity: 1,
      });
      setLoading(false);
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
      
    } catch (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  return (
    <div className='p-3 max-w-3xl mx-auto min-h-screen'>
      <h1 className='text-3xl font-bold my-6 text-center dark:text-white'>
        Use Supply
      </h1>
      
      <form className='flex flex-col gap-4' onSubmit={handleSubmit}>
        <div>
          <Label value='Select Item' />
          <Select
            id='item'
            value={formData.item}
            onChange={handleChange}
            required
          >
            <option value=''>Select an item</option>
            {items.map((item) => (
              <option 
                key={item._id} 
                value={item._id}
                disabled={item.currentStock <= 0}
              >
                {item.name} (Available: {item.currentStock})
              </option>
            ))}
          </Select>
        </div>
        
        <div>
          <Label value='Quantity' />
          <TextInput
            type='number'
            id='quantity'
            min='1'
            max={selectedItem ? selectedItem.currentStock : 1}
            value={formData.quantity}
            onChange={handleChange}
            required
          />
        </div>
        
        {selectedItem && (
          <div className='p-4 bg-gray-50 dark:bg-gray-700 rounded-lg'>
            <h2 className='text-lg font-semibold mb-2 dark:text-white'>Selected Item Information</h2>
            <p className='dark:text-gray-300'>Current Stock: <span className='font-bold'>{selectedItem.currentStock}</span></p>
            <p className='dark:text-gray-300'>Reorder Threshold: <span className='font-bold'>{selectedItem.reorderThreshold}</span></p>
            <p className='mt-2 dark:text-gray-300'>
              {selectedItem.currentStock <= selectedItem.reorderThreshold && (
                <span className='text-red-500 font-bold'>
                  Warning: This item is at or below the reorder threshold.
                </span>
              )}
            </p>
          </div>
        )}
        
        <Button
          gradientDuoTone='purpleToPink'
          type='submit'
          disabled={loading || !selectedItem || selectedItem.currentStock <= 0}
        >
          {loading ? (
            <>
              <Spinner size='sm' />
              <span className='pl-3'>Processing...</span>
            </>
          ) : (
            'Record Usage'
          )}
        </Button>
      </form>
      
      {error && (
        <Alert className='mt-5' color='failure'>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert className='mt-5' color='success'>
          {success}
        </Alert>
      )}
    </div>
  );
} 