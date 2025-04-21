import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Button, Table, Badge, Spinner, Select, Pagination } from 'flowbite-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { apiGet } from '../utils/apiConfig';

export default function ActivityHistory() {
  const { currentUser } = useSelector((state) => state.user);
  const [activityHistory, setActivityHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [items, setItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState('');
  const [totalItems, setTotalItems] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(5);
  
  const location = useLocation();
  const navigate = useNavigate();

  // Parse query parameters on initial load
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const pageParam = queryParams.get('page');
    const limitParam = queryParams.get('limit');
    const itemParam = queryParams.get('item');
    
    if (pageParam) setCurrentPage(parseInt(pageParam));
    if (limitParam) setLimit(parseInt(limitParam));
    if (itemParam) setSelectedItem(itemParam);
  }, [location.search]);

  // Fetch items for the dropdown
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

  // Fetch activity history
  useEffect(() => {
    const fetchActivityHistory = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // First, get total counts from both APIs
        const countParams = new URLSearchParams();
        if (selectedItem) countParams.append('item', selectedItem);
        countParams.append('count', 'true');
        
        // Get count of stock records
        const stockCountRes = await apiGet(`stock/count?${countParams.toString()}`);
        
        // Get count of usage records
        const usageCountRes = await apiGet(`stockUsage/count?${countParams.toString()}`);
        
        let stockCount = 0;
        let usageCount = 0;
        
        if (stockCountRes.ok) {
          const stockCountData = await stockCountRes.json();
          stockCount = stockCountData.count || 0;
        }
        
        if (usageCountRes.ok) {
          const usageCountData = await usageCountRes.json();
          usageCount = usageCountData.count || 0;
        }
        
        // Total number of records across both APIs
        const totalRecords = stockCount + usageCount;
        setTotalItems(totalRecords);
        
        // Calculate offsets for combined pagination
        const totalSkip = (currentPage - 1) * limit;
        let stockSkip = 0;
        let usageSkip = 0;
        let stockLimit = 0;
        let usageLimit = 0;
        
        // If totalSkip is less than stockCount, we need to skip some stock records
        if (totalSkip < stockCount) {
          stockSkip = totalSkip;
          stockLimit = Math.min(limit, stockCount - stockSkip);
          usageSkip = 0;
          usageLimit = limit - stockLimit;
        } else {
          // Skip all stock records and some usage records
          stockSkip = stockCount;
          stockLimit = 0;
          usageSkip = totalSkip - stockCount;
          usageLimit = limit;
        }
        
        // Fetch paginated data from both APIs
        const stockParams = new URLSearchParams();
        if (selectedItem) stockParams.append('item', selectedItem);
        stockParams.append('limit', stockLimit.toString());
        stockParams.append('skip', stockSkip.toString());
        stockParams.append('populate', 'createdBy');
        
        const usageParams = new URLSearchParams();
        if (selectedItem) usageParams.append('item', selectedItem);
        usageParams.append('limit', usageLimit.toString());
        usageParams.append('skip', usageSkip.toString());
        usageParams.append('populate', 'createdBy');
        
        let stockData = [];
        let usageData = [];
        
        // Only fetch stock data if we need it
        if (stockLimit > 0) {
          const stockRes = await apiGet(`stock?${stockParams.toString()}`);
          
          if (stockRes.ok) {
            const data = await stockRes.json();
            stockData = Array.isArray(data) ? data : 
                       Array.isArray(data.items) ? data.items : [];
            
            // Validate backend sorting in development mode
            if (process.env.NODE_ENV === 'development' && stockData.length > 1) {
              const isSorted = stockData.every((item, i) => 
                i === 0 || 
                new Date(stockData[i-1].createdAt) >= new Date(item.createdAt)
              );
              console.log('Stock data sorted correctly by backend:', isSorted);
              
              if (!isSorted) {
                console.warn('Stock data not properly sorted by date from backend');
              }
            }
          }
        }
        
        // Only fetch usage data if we need it
        if (usageLimit > 0) {
          const usageRes = await apiGet(`stockUsage?${usageParams.toString()}`);
          
          if (usageRes.ok) {
            const data = await usageRes.json();
            usageData = Array.isArray(data) ? data : 
                       Array.isArray(data.items) ? data.items : [];
            
            // Validate backend sorting in development mode
            if (process.env.NODE_ENV === 'development' && usageData.length > 1) {
              const isSorted = usageData.every((item, i) => 
                i === 0 || 
                new Date(usageData[i-1].createdAt) >= new Date(item.createdAt)
              );
              console.log('Usage data sorted correctly by backend:', isSorted);
              
              if (!isSorted) {
                console.warn('Usage data not properly sorted by date from backend');
              }
            }
          }
        }
        
        // Combine and sort data
        const combinedActivity = [
          ...stockData.map(item => ({ 
            ...item, 
            type: 'addition',
            // Ensure consistent date field for sorting
            sortDate: new Date(item.createdAt || item.dateAdded || item.updatedAt || Date.now())
          })),
          ...usageData.map(item => ({ 
            ...item, 
            type: 'usage',
            // Ensure consistent date field for sorting
            sortDate: new Date(item.createdAt || item.dateAdded || item.updatedAt || Date.now())
          }))
        ].sort((a, b) => {
          // Sort by date and time in descending order (newest first)
          return b.sortDate - a.sortDate;
        });
        
        // Log date comparison for debugging
        if (process.env.NODE_ENV === 'development' && combinedActivity.length > 0) {
          console.log('Combined & sorted activities (showing first 3):',
            combinedActivity.slice(0, 3).map(item => ({
              id: item._id,
              type: item.type,
              date: item.sortDate,
              formattedDate: item.sortDate.toLocaleString()
            }))
          );
        }
        
        setActivityHistory(combinedActivity);
        
        // Update URL with current parameters
        const queryParams = new URLSearchParams();
        if (selectedItem) queryParams.append('item', selectedItem);
        queryParams.append('limit', limit.toString());
        queryParams.append('page', currentPage.toString());
        navigate(`/activity-history?${queryParams.toString()}`, { replace: true });
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching activity history:', error);
        setError(error.message || 'Failed to fetch activity history');
        setLoading(false);
      }
    };
    
    fetchActivityHistory();
  }, [selectedItem, limit, currentPage, navigate]);

  const handleItemChange = (e) => {
    setSelectedItem(e.target.value);
    setCurrentPage(1); // Reset to first page when item filter changes
  };

  const handleLimitChange = (e) => {
    setLimit(Number(e.target.value));
    setCurrentPage(1); // Reset to first page when limit changes
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Calculate total pages
  const totalPages = Math.ceil(totalItems / limit);

  return (
    <div className='max-w-6xl mx-auto p-3'>
      <h1 className='text-3xl font-bold my-6 text-center dark:text-white'>
        Activity History
      </h1>
      
      <div className='flex flex-col md:flex-row justify-between items-center gap-4 mb-6'>
        <div className='flex-1 md:flex-initial md:w-1/3'>
          <label className="block mb-1 text-sm font-medium text-gray-900 dark:text-white">Filter by Item</label>
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
        
        <div className='md:flex-initial md:w-1/4'>
          <label className="block mb-1 text-sm font-medium text-gray-900 dark:text-white">Items per page</label>
          <Select 
            id='limit' 
            value={limit} 
            onChange={handleLimitChange}
          >
            <option value={5}>5 items</option>
            <option value={10}>10 items</option>
            <option value={20}>20 items</option>
            <option value={50}>50 items</option>
            <option value={100}>100 items</option>
          </Select>
        </div>
        
        <div className='flex gap-2'>
          <Button gradientDuoTone='purpleToPink'>
            <Link to='/add-stock'>Add Stock</Link>
          </Button>
          <Button gradientDuoTone='cyanToBlue'>
            <Link to='/use-stock'>Record Usage</Link>
          </Button>
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
      ) : activityHistory.length === 0 ? (
        <div className='text-center dark:text-white min-h-[400px] flex items-center justify-center'>
          <p>No activity records found</p>
        </div>
      ) : (
        <>
          <Table hoverable>
            <Table.Head>
              <Table.HeadCell>Item</Table.HeadCell>
              <Table.HeadCell>Quantity</Table.HeadCell>
              <Table.HeadCell>Action</Table.HeadCell>
              <Table.HeadCell>User</Table.HeadCell>
              <Table.HeadCell>Date</Table.HeadCell>
              {currentUser.isAdmin && <Table.HeadCell>Actions</Table.HeadCell>}
            </Table.Head>
            <Table.Body className='divide-y'>
              {activityHistory.map((activity) => (
                <Table.Row key={activity._id} className='bg-white dark:bg-gray-800'>
                  <Table.Cell className='font-medium text-gray-900 dark:text-white'>
                    {activity.item?.name || 'Unknown Item'}
                  </Table.Cell>
                  <Table.Cell>
                    {activity.type === 'addition' ? (
                      <Badge color='success' className='font-medium'>
                        +{activity.quantity}
                      </Badge>
                    ) : (
                      <Badge color='indigo' className='font-medium'>
                        -{activity.quantity}
                      </Badge>
                    )}
                  </Table.Cell>
                  <Table.Cell>
                    {activity.type === 'addition' ? (
                      <Badge color='success'>Added</Badge>
                    ) : (
                      <Badge color='indigo'>Used</Badge>
                    )}
                  </Table.Cell>
                  <Table.Cell>{activity.createdBy?.username || 'Unknown User'}</Table.Cell>
                  <Table.Cell>
                    {activity.sortDate ? (
                      <>
                        {activity.sortDate.toLocaleDateString()} {' '}
                        <span className="text-sm text-gray-500">
                          {activity.sortDate.toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit'
                          })}
                        </span>
                      </>
                    ) : (
                      new Date(activity.createdAt || activity.dateAdded).toLocaleString()
                    )}
                  </Table.Cell>
                  {currentUser.isAdmin && (
                    <Table.Cell>
                      <div className='flex gap-2'>
                        <Button size='xs' color='warning'>
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
          
          {totalPages > 1 && (
            <div className="flex justify-center mt-4">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                showIcons
              />
            </div>
          )}
        </>
      )}
    </div>
  );
} 