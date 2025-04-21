import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Spinner, Table, Badge, Card, Avatar } from 'flowbite-react';
import { Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { apiGet } from '../utils/apiConfig';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

// Update the default image to a more reliable source
const DEFAULT_IMAGE = 'https://placehold.co/200x200?text=Item';

export default function Dashboard() {
  const { currentUser } = useSelector((state) => state.user);
  const [items, setItems] = useState([]);
  const [lowStockItems, setLowStockItems] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [totalUsed, setTotalUsed] = useState(0);
  const [loading, setLoading] = useState(true);
  const [stockData, setStockData] = useState({
    labels: [],
    datasets: [
      {
        label: 'Current Stock',
        data: [],
        borderColor: 'rgb(53, 162, 235)',
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
      },
    ],
  });
  const [stockDistribution, setStockDistribution] = useState({
    labels: [],
    datasets: [
      {
        label: 'Stock Distribution',
        data: [],
        backgroundColor: [
          'rgba(255, 99, 132, 0.5)',
          'rgba(54, 162, 235, 0.5)',
          'rgba(255, 206, 86, 0.5)',
          'rgba(75, 192, 192, 0.5)',
          'rgba(153, 102, 255, 0.5)',
          'rgba(255, 159, 64, 0.5)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)',
        ],
        borderWidth: 1,
      },
    ],
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // Fetch all items to have access to their images
        const itemsRes = await apiGet('items');
        const itemsData = await itemsRes.json();
        
        // Handle the data format where items may be wrapped in an 'items' property
        const itemsArray = Array.isArray(itemsData) ? itemsData : 
                           Array.isArray(itemsData.items) ? itemsData.items : [];
        
        // Create an items lookup map for easy access
        const itemsMap = {};
        itemsArray.forEach(item => {
          if (item && item._id) {
            itemsMap[item._id] = item;
          }
        });
        
        // Fetch low stock items
        const lowStockRes = await apiGet('items/low-stock/all');
        const lowStockData = await lowStockRes.json();
        
        // Handle the data format where items may be wrapped in an 'items' property
        const lowStockArray = Array.isArray(lowStockData) ? lowStockData : 
                              Array.isArray(lowStockData.items) ? lowStockData.items : [];
        
        // Fetch recent activity (combine stock and usage)
        const stockRes = await apiGet('stock?limit=5&populate=createdBy');
        const stockData = await stockRes.json();
        
        const usageRes = await apiGet('stockUsage?limit=5&populate=createdBy');
        const usageData = await usageRes.json();
        
        // Fetch all usage data to calculate total used
        const allUsageRes = await apiGet('stockUsage?populate=createdBy');
        const allUsageData = await allUsageRes.json();
        
        // Calculate total used quantity
        const usedQuantity = Array.isArray(allUsageData) 
          ? allUsageData.reduce((sum, usage) => sum + (usage.quantity || 0), 0)
          : 0;
        
        setTotalUsed(usedQuantity);
        
        // Combine and sort by date
        const allActivity = [
          ...stockData.map(item => ({ 
            ...item, 
            type: 'addition',
            fullItem: item.item && item.item._id ? itemsMap[item.item._id] || item.item : item.item
          })),
          ...usageData.map(item => ({ 
            ...item, 
            type: 'usage',
            fullItem: item.item && item.item._id ? itemsMap[item.item._id] || item.item : item.item
          }))
        ].sort((a, b) => new Date(b.createdAt || b.dateAdded) - new Date(a.createdAt || a.dateAdded))
        .slice(0, 5);
        
        console.log('Enhanced activity data with full items:', allActivity);
        // If there's data, log the first item to see its structure
        if (allActivity.length > 0) {
          console.log('First activity item structure:', JSON.stringify(allActivity[0], null, 2));
          console.log('Item image paths:', {
            item: allActivity[0].item,
            imagePath: allActivity[0].item?.image,
            picturePath: allActivity[0].item?.picturePath
          });
        }
        
        setItems(itemsArray);
        setLowStockItems(lowStockArray);
        setRecentActivity(allActivity);
        
        // Prepare chart data
        if (itemsArray.length > 0) {
          // Stock levels chart
          const stockItems = itemsArray.slice(0, 10);
          const labels = stockItems.map(item => `${item.name} (${item.currentStock})`);
          const data = stockItems.map(item => item.currentStock);
          
          setStockData({
            labels,
            datasets: [
              {
                label: 'Current Stock',
                data,
                borderColor: 'rgb(53, 162, 235)',
                backgroundColor: 'rgba(53, 162, 235, 0.5)',
              },
            ],
          });
          
          // Stock distribution chart
          // Calculate total stock for percentage calculation
          const totalStock = data.reduce((sum, stockValue) => sum + (stockValue || 0), 0);
          
          // Create labels with percentage
          const labelsWithPercentage = labels.map((label, index) => {
            // Calculate percentage and format it to 1 decimal place
            const percentage = totalStock > 0 ? ((data[index] / totalStock) * 100).toFixed(1) : 0;
            return `${label} (${percentage}%)`;
          });
          
          setStockDistribution({
            labels: labelsWithPercentage,
            datasets: [
              {
                label: 'Stock Distribution',
                data,
                backgroundColor: [
                  'rgba(255, 99, 132, 0.5)',
                  'rgba(54, 162, 235, 0.5)',
                  'rgba(255, 206, 86, 0.5)',
                  'rgba(75, 192, 192, 0.5)',
                  'rgba(153, 102, 255, 0.5)',
                  'rgba(255, 159, 64, 0.5)',
                ],
                borderColor: [
                  'rgba(255, 99, 132, 1)',
                  'rgba(54, 162, 235, 1)',
                  'rgba(255, 206, 86, 1)',
                  'rgba(75, 192, 192, 1)',
                  'rgba(153, 102, 255, 1)',
                  'rgba(255, 159, 64, 1)',
                ],
                borderWidth: 1,
              },
            ],
          });
        }
        
        setLoading(false);
      } catch (error) {
        console.log(error);
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className='flex justify-center items-center min-h-screen'>
        <Spinner size='xl' />
      </div>
    );
  }

  return (
    <div className='p-3 max-w-6xl mx-auto'>
      <h1 className='text-3xl font-bold my-6 text-center dark:text-white'>
        Dashboard
      </h1>
      
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6'>
        <Card>
          <div className='flex justify-between items-center'>
            <h5 className='text-xl font-bold tracking-tight text-gray-900 dark:text-white'>
              Total Items
            </h5>
            <span className='text-2xl font-bold text-blue-600'>{Array.isArray(items) ? items.length : 0}</span>
          </div>
        </Card>
        <Card>
          <div className='flex justify-between items-center'>
            <h5 className='text-xl font-bold tracking-tight text-gray-900 dark:text-white'>
              Low Stock Items
            </h5>
            <span className='text-2xl font-bold text-red-600'>{Array.isArray(lowStockItems) ? lowStockItems.length : 0}</span>
          </div>
        </Card>
        <Card>
          <div className='flex justify-between items-center'>
            <h5 className='text-xl font-bold tracking-tight text-gray-900 dark:text-white'>
              Total Inventory
            </h5>
            <span className='text-2xl font-bold text-green-600'>
              {Array.isArray(items) ? items.reduce((acc, item) => acc + (item.currentStock || 0), 0) : 0}
            </span>
          </div>
        </Card>
        <Card>
          <div className='flex justify-between items-center'>
            <h5 className='text-xl font-bold tracking-tight text-gray-900 dark:text-white'>
              Total Used
            </h5>
            <span className='text-2xl font-bold text-indigo-600'>
              {totalUsed}
            </span>
          </div>
        </Card>
      </div>
      
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6'>
        <Card>
          <h5 className='text-xl font-bold tracking-tight text-gray-900 dark:text-white mb-4'>
            Stock Levels
          </h5>
          <div className='h-64'>
            <Line data={stockData} options={{ maintainAspectRatio: false }} />
          </div>
        </Card>
        <Card>
          <h5 className='text-xl font-bold tracking-tight text-gray-900 dark:text-white mb-4'>
            Stock Distribution
          </h5>
          <div className='h-64'>
            <Doughnut 
              data={stockDistribution} 
              options={{ 
                maintainAspectRatio: false,
                plugins: {
                  tooltip: {
                    callbacks: {
                      label: function(context) {
                        const value = context.raw || 0;
                        const dataset = context.chart.data.datasets[0];
                        const total = dataset.data.reduce((sum, val) => sum + (val || 0), 0);
                        const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                        return `Quantity: ${value} (${percentage}%)`;
                      }
                    }
                  }
                }
              }} 
            />
          </div>
        </Card>
      </div>
      
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        <Card className="flex flex-col relative h-[400px]">
          <div className='flex justify-between items-center mb-4 sticky top-0 bg-white dark:bg-gray-800 z-10 pt-1'>
            <h5 className='text-xl font-bold tracking-tight text-gray-900 dark:text-white'>
              Low Stock Items
            </h5>
            <div className="flex gap-3">
              <Link 
                to='/add-stock' 
                className='flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 hover:scale-105 focus:ring-4 focus:ring-blue-300 transition-all duration-300 shadow-md dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800'
              >
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Add Supply
              </Link>
              {currentUser && currentUser.isAdmin && (
                <Link 
                  to='/create-item' 
                  className='flex items-center px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 hover:scale-105 focus:ring-4 focus:ring-purple-300 transition-all duration-300 shadow-md dark:bg-purple-600 dark:hover:bg-purple-700 dark:focus:ring-purple-800'
                >
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM14 11a1 1 0 011 1v1h1a1 1 0 110 2h-1v1a1 1 0 11-2 0v-1h-1a1 1 0 110-2h1v-1a1 1 0 011-1z" />
                  </svg>
                  Create Item
                </Link>
              )}
            </div>
          </div>
          <div className="overflow-y-auto flex-grow">
            <Table>
              <Table.Head className="sticky top-0 bg-gray-50 dark:bg-gray-700">
                <Table.HeadCell>Item Name</Table.HeadCell>
                <Table.HeadCell>Current</Table.HeadCell>
                <Table.HeadCell>Minimum</Table.HeadCell>
                <Table.HeadCell>Status</Table.HeadCell>
              </Table.Head>
              <Table.Body className='divide-y'>
                {Array.isArray(lowStockItems) && lowStockItems.length > 0 ? (
                  lowStockItems.map((item) => (
                    <Table.Row key={item._id} className='bg-white dark:bg-gray-800'>
                      <Table.Cell>{item.name}</Table.Cell>
                      <Table.Cell>{item.currentStock}</Table.Cell>
                      <Table.Cell>{item.reorderThreshold}</Table.Cell>
                      <Table.Cell>
                        {item.currentStock === 0 ? (
                          <Badge color='failure'>Out of Stock</Badge>
                        ) : (
                          <Badge color='warning'>Low Stock</Badge>
                        )}
                      </Table.Cell>
                    </Table.Row>
                  ))
                ) : (
                  <Table.Row>
                    <Table.Cell colSpan={4} className='text-center'>
                      No items with low stock levels
                    </Table.Cell>
                  </Table.Row>
                )}
              </Table.Body>
            </Table>
          </div>
        </Card>
        
        <Card className="h-[400px] flex flex-col">
          <div className='flex justify-between items-center mb-4 sticky top-0 bg-white dark:bg-gray-800 z-10 pt-1'>
            <h5 className='text-xl font-bold tracking-tight text-gray-900 dark:text-white'>
              Recent Activity
            </h5>
            <div className='flex gap-3'>
              <Link 
                to='/stock-history' 
                className='flex items-center px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 hover:scale-105 focus:ring-4 focus:ring-green-300 transition-all duration-300 shadow-md dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800'
              >
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                </svg>
                Stock History
              </Link>
              <Link 
                to='/usage-history' 
                className='flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 hover:scale-105 focus:ring-4 focus:ring-indigo-300 transition-all duration-300 shadow-md dark:bg-indigo-600 dark:hover:bg-indigo-700 dark:focus:ring-indigo-800'
              >
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z" clipRule="evenodd" />
                </svg>
                Usage History
              </Link>
              <Link 
                to='/activity-history' 
                className='flex items-center px-4 py-2 text-sm font-medium text-white bg-gray-600 rounded-lg hover:bg-gray-700 hover:scale-105 focus:ring-4 focus:ring-gray-300 transition-all duration-300 shadow-md dark:bg-gray-600 dark:hover:bg-gray-700 dark:focus:ring-gray-800'
              >
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
                All Activities
              </Link>
            </div>
          </div>
          <div className="overflow-y-auto flex-grow">
            <Table>
              <Table.Head className="sticky top-0 bg-gray-50 dark:bg-gray-700">
                <Table.HeadCell>Item</Table.HeadCell>
                <Table.HeadCell>Quantity</Table.HeadCell>
                <Table.HeadCell>User</Table.HeadCell>
                <Table.HeadCell>Date</Table.HeadCell>
              </Table.Head>
              <Table.Body className='divide-y'>
                {Array.isArray(recentActivity) && recentActivity.length > 0 ? (
                  recentActivity.map((activity) => (
                    <Table.Row 
                      key={activity._id} 
                      className={`
                        ${activity.type === 'addition' 
                          ? 'bg-green-50 hover:bg-green-100 dark:bg-green-900/20 dark:hover:bg-green-900/30' 
                          : 'bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/20 dark:hover:bg-indigo-900/30'
                        }
                      `}
                    >
                      <Table.Cell>
                        <div className="flex items-center space-x-3">
                          {(() => {
                            const fullItem = activity.fullItem || activity.item;
                            const imageUrl = fullItem?.picturePath || fullItem?.image;
                            
                            return (
                              <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                                {imageUrl ? (
                                  <img 
                                    src={imageUrl}
                                    className="w-12 h-12 object-cover"
                                    alt={fullItem?.name || 'Item'}
                                    onError={(e) => {
                                      e.target.onerror = null; // Prevent infinite loops
                                      e.target.style.display = 'none'; // Hide the broken image
                                      e.target.nextElementSibling.style.display = 'flex'; // Show the fallback
                                    }}
                                  />
                                ) : null}
                                <div 
                                  className={`absolute inset-0 w-12 h-12 flex items-center justify-center text-lg font-bold ${
                                    !imageUrl ? 'display-flex' : 'hidden'
                                  } ${
                                    activity.type === 'addition' 
                                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' 
                                      : 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300'
                                  }`}
                                >
                                  {fullItem?.name?.charAt(0).toUpperCase() || 'I'}
                                </div>
                              </div>
                            );
                          })()}
                          <div>
                            <span className="font-medium">{activity.item?.name || 'Item'}</span>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {activity.type === 'addition' ? 'Added to stock' : 'Used from stock'}
                            </div>
                          </div>
                        </div>
                      </Table.Cell>
                      <Table.Cell>{activity.quantity}</Table.Cell>
                      <Table.Cell>{activity.createdBy?.username || 'Unknown'}</Table.Cell>
                      <Table.Cell>
                        {new Date(activity.createdAt || activity.dateAdded).toLocaleDateString()}
                      </Table.Cell>
                    </Table.Row>
                  ))
                ) : (
                  <Table.Row>
                    <Table.Cell colSpan={4} className='text-center'>
                      No recent activity
                    </Table.Cell>
                  </Table.Row>
                )}
              </Table.Body>
            </Table>
          </div>
        </Card>
      </div>
    </div>
  );
} 