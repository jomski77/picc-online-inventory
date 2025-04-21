import { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { Alert, Button, Label, Select, TextInput, Spinner } from 'flowbite-react';
import { apiGet, apiPost } from '../utils/apiConfig';

export default function AddStock() {
  const { currentUser } = useSelector((state) => state.user);
  const [formData, setFormData] = useState({
    item: '',
    quantity: 1,
  });
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [updatedItem, setUpdatedItem] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);

  // Create fetchItems as a memoized function so it can be called after adding stock
  const fetchItems = useCallback(async () => {
    try {
      const res = await apiGet('items');
      const data = await res.json();
      setItems(Array.isArray(data) ? data : 
               Array.isArray(data.items) ? data.items : []);
    } catch (error) {
      console.log('Error fetching items:', error);
    }
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  // Update selectedItem when item selection changes
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
    
    try {
      setLoading(true);
      setError(null);
      
      const res = await apiPost('stock', {
        item: formData.item,
        quantity: Number(formData.quantity),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        setError(data.message);
        setLoading(false);
        return;
      }
      
      // Save the previous stock value for comparison
      const prevStock = items.find(item => item._id === formData.item)?.currentStock || 0;
      
      // Reset form data but keep the selected item
      const selectedItem = formData.item;
      setFormData({
        item: selectedItem, // Keep the same item selected
        quantity: 1,
      });
      
      // Refresh items list to get updated stock values
      await fetchItems();
      
      // Set the updated item to highlight the change
      setUpdatedItem({
        id: selectedItem,
        prevStock,
        quantity: Number(formData.quantity)
      });
      
      setSuccess('Stock added successfully');
      setLoading(false);
      
      // Clear success message and updated item highlight after 3 seconds
      setTimeout(() => {
        setSuccess(null);
        setUpdatedItem(null);
      }, 3000);
      
    } catch (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  return (
    <div className='p-3 max-w-3xl mx-auto min-h-screen'>
      <h1 className='text-3xl font-bold my-6 text-center dark:text-white'>
        Add Supply
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
              <option key={item._id} value={item._id}>
                {item.name} (Current Stock: {item.currentStock})
              </option>
            ))}
          </Select>
          {formData.item && (
            <div className="mt-2 text-sm text-blue-600 dark:text-blue-400">
              {items.find(item => item._id === formData.item)?.currentStock !== undefined && (
                <>Current stock: <span className="font-semibold">{items.find(item => item._id === formData.item)?.currentStock}</span></>
              )}
            </div>
          )}
        </div>
        
        <div>
          <Label value='Quantity' />
          <TextInput
            type='number'
            id='quantity'
            min='1'
            value={formData.quantity}
            onChange={handleChange}
            required
          />
        </div>
        
        {selectedItem && (
          <div className='p-4 bg-gray-50 dark:bg-gray-700 rounded-lg'>
            <h2 className='text-lg font-semibold mb-2 dark:text-white'>Selected Item Information</h2>
            <p className='dark:text-gray-300'>Current Stock: <span className='font-bold'>{selectedItem.currentStock}</span></p>
            {selectedItem.reorderThreshold && (
              <p className='dark:text-gray-300'>Reorder Threshold: <span className='font-bold'>{selectedItem.reorderThreshold}</span>
                {selectedItem.currentStock <= selectedItem.reorderThreshold && (
                  <span className='ml-2 text-yellow-500 font-bold'>
                    (Low Stock)
                  </span>
                )}
              </p>
            )}
          </div>
        )}
        
        <Button
          gradientDuoTone='purpleToPink'
          type='submit'
          disabled={loading || !selectedItem}
        >
          {loading ? (
            <>
              <Spinner size='sm' />
              <span className='pl-3'>Processing...</span>
            </>
          ) : (
            'Add Supply'
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

      {formData.item && updatedItem && updatedItem.id === formData.item && (
        <div className="mt-5">
          <Alert color="success" className="animate-pulse">
            <span className="font-medium">Stock updated!</span> Added {updatedItem.quantity} units (previous stock: {updatedItem.prevStock})
          </Alert>
        </div>
      )}
    </div>
  );
} 