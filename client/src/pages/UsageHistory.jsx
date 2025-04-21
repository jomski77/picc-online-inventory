import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Button, Table, Badge, Spinner, Select } from 'flowbite-react';
import { Link } from 'react-router-dom';
import { apiGet } from '../utils/apiConfig';

export default function UsageHistory() {
  const { currentUser } = useSelector((state) => state.user);
  const [usageHistory, setUsageHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [items, setItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState('');

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const res = await apiGet('items');
        const data = await res.json();
        setItems(data);
      } catch (error) {
        console.log(error);
      }
    };
    fetchItems();
  }, []);

  useEffect(() => {
    const fetchUsageHistory = async () => {
      try {
        setLoading(true);
        setError(null);
        
        let endpoint = 'stockUsage';
        const params = new URLSearchParams();
        
        if (selectedItem) {
          params.append('item', selectedItem);
        }
        
        params.append('populate', 'createdBy');
        
        const url = params.toString() ? `${endpoint}?${params.toString()}` : endpoint;
        const res = await apiGet(url);
        
        if (!res.ok) {
          throw new Error('Failed to fetch usage history');
        }
        
        const data = await res.json();
        setUsageHistory(data);
        setLoading(false);
      } catch (error) {
        setError(error.message);
        setLoading(false);
      }
    };
    
    fetchUsageHistory();
  }, [selectedItem]);

  const handleItemChange = (e) => {
    setSelectedItem(e.target.value);
  };

  return (
    <div className='max-w-6xl mx-auto p-3'>
      <h1 className='text-3xl font-bold my-6 text-center dark:text-white'>
        Supply Usage History
      </h1>
      
      <div className='flex flex-col md:flex-row justify-between items-center gap-4 mb-6'>
        <div className='flex-1'>
          <Select 
            id='item' 
            value={selectedItem} 
            onChange={handleItemChange}
          >
            <option value=''>All Items</option>
            {items.map((item) => (
              <option key={item._id} value={item._id}>
                {item.name}
              </option>
            ))}
          </Select>
        </div>
        
        <div>
          <Link 
            to='/use-stock' 
            className='flex items-center px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-100 rounded-lg hover:bg-indigo-200 transition duration-300 dark:text-indigo-400 dark:bg-indigo-900/30 dark:hover:bg-indigo-900/50'
          >
            Record Supply Usage
          </Link>
        </div>
      </div>
      
      {loading ? (
        <div className='flex justify-center items-center min-h-[400px]'>
          <Spinner size='xl' />
        </div>
      ) : error ? (
        <div className='text-center text-red-500'>
          <p>{error}</p>
        </div>
      ) : usageHistory.length === 0 ? (
        <div className='text-center dark:text-white min-h-[400px] flex items-center justify-center'>
          <p>No usage records found</p>
        </div>
      ) : (
        <Table hoverable>
          <Table.Head>
            <Table.HeadCell>Item</Table.HeadCell>
            <Table.HeadCell>Quantity</Table.HeadCell>
            <Table.HeadCell>Used By</Table.HeadCell>
            <Table.HeadCell>Date Used</Table.HeadCell>
            {currentUser.isAdmin && <Table.HeadCell>Actions</Table.HeadCell>}
          </Table.Head>
          <Table.Body className='divide-y'>
            {usageHistory.map((usage) => (
              <Table.Row key={usage._id} className='bg-white dark:bg-gray-800'>
                <Table.Cell className='font-medium text-gray-900 dark:text-white'>
                  {usage.item?.name || 'Unknown Item'}
                </Table.Cell>
                <Table.Cell>
                  <Badge color='indigo' className='font-medium'>
                    -{usage.quantity}
                  </Badge>
                </Table.Cell>
                <Table.Cell>{usage.createdBy?.username || 'Unknown User'}</Table.Cell>
                <Table.Cell>
                  {new Date(usage.dateAdded).toLocaleDateString()} at{' '}
                  {new Date(usage.dateAdded).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Table.Cell>
                {currentUser.isAdmin && (
                  <Table.Cell>
                    <div className='flex gap-2'>
                      <Button 
                        size='xs'
                        color='warning'
                        as={Link}
                        to={`/edit-usage/${usage._id}`}
                      >
                        Edit
                      </Button>
                      <Button size='xs' color='failure'>
                        Delete
                      </Button>
                    </div>
                  </Table.Cell>
                )}
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      )}
    </div>
  );
} 