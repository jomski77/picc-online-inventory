import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Alert, Button, Label, TextInput, Spinner, Select } from 'flowbite-react';
import { useNavigate, useParams } from 'react-router-dom';
import { apiGet, apiPut } from '../utils/apiConfig';

export default function EditStock() {
  const { currentUser } = useSelector((state) => state.user);
  const [formData, setFormData] = useState({
    quantity: 0,
    item: '',
  });
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const { stockId } = useParams();

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const res = await apiGet('items');
        const data = await res.json();
        setItems(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error fetching items:', error);
      }
    };

    const fetchStockRecord = async () => {
      try {
        setLoading(true);
        
        const res = await apiGet(`stock/${stockId}`);
        
        if (!res.ok) {
          throw new Error('Failed to fetch stock record');
        }
        
        const data = await res.json();
        
        setFormData({
          quantity: data.quantity,
          item: data.item?._id || data.item || '',
        });
        
        setLoading(false);
      } catch (error) {
        setError(error.message);
        setLoading(false);
      }
    };
    
    fetchItems();
    fetchStockRecord();
  }, [stockId]);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData({ ...formData, [id]: id === 'quantity' ? Number(value) : value });
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
      setSubmitting(true);
      setError(null);
      
      const res = await apiPut(`stock/${stockId}`, {
        quantity: formData.quantity,
        item: formData.item,
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        setSubmitting(false);
        return setError(data.message);
      }
      
      setSubmitting(false);
      setSuccess(true);
      setTimeout(() => {
        navigate('/stock-history');
      }, 2000);
      
    } catch (error) {
      setSubmitting(false);
      setError(error.message);
    }
  };

  if (loading) {
    return (
      <div className='flex justify-center items-center min-h-screen'>
        <Spinner size='xl' />
      </div>
    );
  }

  return (
    <div className='p-3 max-w-3xl mx-auto'>
      <h1 className='text-3xl font-bold my-6 text-center dark:text-white'>
        Edit Supply Addition
      </h1>
      
      {error && (
        <Alert color='failure' className='mb-4'>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert color='success' className='mb-4'>
          Supply addition updated successfully! Redirecting...
        </Alert>
      )}
      
      <form className='flex flex-col gap-4' onSubmit={handleSubmit}>
        <div className='mb-4'>
          <Label value='Select Item' />
          <Select
            id='item'
            value={formData.item}
            onChange={(e) => setFormData({ ...formData, item: e.target.value })}
            required
            disabled={!currentUser.isAdmin}
          >
            <option value=''>Select an item</option>
            {items.map((item) => (
              <option key={item._id} value={item._id}>
                {item.name}
              </option>
            ))}
          </Select>
        </div>
        
        <div className='mb-4'>
          <Label value='Quantity' />
          <TextInput
            type='number'
            id='quantity'
            placeholder='Enter quantity'
            value={formData.quantity}
            onChange={handleChange}
            min={1}
            required
          />
        </div>
        
        <div className='flex gap-4 justify-center'>
          <Button
            type='submit'
            gradientDuoTone='greenToBlue'
            outline
            disabled={submitting}
          >
            {submitting ? (
              <>
                <Spinner size='sm' />
                <span className='pl-3'>Updating...</span>
              </>
            ) : (
              'Update Record'
            )}
          </Button>
          <Button
            color='gray'
            onClick={() => navigate('/stock-history')}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
} 