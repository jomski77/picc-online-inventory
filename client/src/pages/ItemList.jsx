import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Button, Spinner, Table, Alert, Card } from 'flowbite-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { HiInformationCircle } from 'react-icons/hi';
import { TextInput } from 'flowbite-react';
import { FaSearch } from 'react-icons/fa';
import { apiGet } from '../utils/apiConfig';

// Default image to use when no image is provided
const DEFAULT_IMAGE = 'https://eurzpxkjndcnhmdsggvs.supabase.co/storage/v1/object/public/picc-inventory-images/default-supply-image.png';

// Mock data for development or when API is not available
const MOCK_ITEMS = [
  {
    _id: 'mock-item-1',
    name: 'Sample Item 1',
    category: 'Electronics',
    description: 'This is a sample item for testing purposes',
    currentStock: 25,
    reorderThreshold: 10,
    location: 'Warehouse A',
    image: DEFAULT_IMAGE,
    lastUpdated: new Date().toISOString(),
  },
  {
    _id: 'mock-item-2',
    name: 'Sample Item 2',
    category: 'Office Supplies',
    description: 'Another sample item for testing',
    currentStock: 5,
    reorderThreshold: 15,
    location: 'Storage Room B',
    image: DEFAULT_IMAGE,
    lastUpdated: new Date().toISOString(),
  },
  {
    _id: 'mock-item-3',
    name: 'Sample Item 3',
    category: 'Medical',
    description: 'A medical item sample',
    currentStock: 50,
    reorderThreshold: 20,
    location: 'Medical Cabinet',
    image: DEFAULT_IMAGE,
    lastUpdated: new Date().toISOString(),
  }
];

export default function ItemList() {
  const { currentUser } = useSelector((state) => state.user);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [usedMockData, setUsedMockData] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchItems = async () => {
      try {
        setLoading(true);
        setUsedMockData(false);
        
        // Get search term from URL if it exists
        const urlParams = new URLSearchParams(location.search);
        const searchTerm = urlParams.get('searchTerm');
        
        // Build URL with search parameter if it exists
        let endpoint = 'items';
        if (searchTerm) {
          endpoint += `?search=${searchTerm}`;
        }
        
        console.log('Fetching items from endpoint:', endpoint);
        const res = await apiGet(endpoint);
        console.log('Response status:', res.status);
        
        // Check if response is OK before trying to parse JSON
        if (!res.ok) {
          const errorText = await res.text();
          console.error('API Error Response:', errorText);
          throw new Error(`Failed to fetch items: ${res.status} ${res.statusText}`);
        }
        
        // Try to parse JSON with error handling
        let data;
        try {
          const textData = await res.text();
          if (!textData || textData.trim() === '') {
            throw new Error('Empty response from server');
          }
          console.log('Response text:', textData); // Log the raw response
          data = JSON.parse(textData);
          console.log('Parsed data:', data); // Log the parsed data
        } catch (parseError) {
          console.error('JSON Parse Error:', parseError);
          throw new Error(`Invalid JSON response: ${parseError.message}`);
        }
        
        // Validate the response structure
        if (!data || typeof data !== 'object') {
          throw new Error('Invalid response format');
        }
        
        // Handle both { items: [...] } and direct array response formats
        const itemsArray = Array.isArray(data) ? data : 
                         (data.items && Array.isArray(data.items)) ? data.items : [];
        
        console.log('Items array to use:', itemsArray);
        
        // Log item structure for debugging
        if (itemsArray.length > 0) {
          console.log('First item structure:', JSON.stringify(itemsArray[0], null, 2));
          console.log('Image/picturePath fields:', {
            hasImage: !!itemsArray[0].image,
            hasPicturePath: !!itemsArray[0].picturePath,
            imageValue: itemsArray[0].image,
            picturePathValue: itemsArray[0].picturePath
          });
        }
        
        setItems(itemsArray);
        
        // Select the first item by default if available
        if (itemsArray.length > 0) {
          setSelectedItem(itemsArray[0]);
        } else {
          setSelectedItem(null);
        }
      } catch (error) {
        console.error('Error fetching items:', error);
        
        // In development, fall back to mock data if API fails
        if (process.env.NODE_ENV === 'development') {
          console.log('Using mock data as fallback');
          
          // Filter mock data if search term exists
          let filteredMockItems = [...MOCK_ITEMS];
          const searchTerm = new URLSearchParams(location.search).get('searchTerm')?.toLowerCase();
          
          if (searchTerm) {
            filteredMockItems = MOCK_ITEMS.filter(item => 
              item.name.toLowerCase().includes(searchTerm) || 
              item.category.toLowerCase().includes(searchTerm) ||
              item.description.toLowerCase().includes(searchTerm)
            );
          }
          
          setItems(filteredMockItems);
          if (filteredMockItems.length > 0) {
            setSelectedItem(filteredMockItems[0]);
          }
          setUsedMockData(true);
        } else {
          setError(error.message || 'Something went wrong');
          setItems([]);
          setSelectedItem(null);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, [location.search]);

  const handleSelectItem = (item) => {
    setSelectedItem(item);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Spinner size="xl" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      {/* Search Form - Always Visible */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-3">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          {location.search && new URLSearchParams(location.search).get('searchTerm') 
            ? 'Search Results' 
            : 'Supplies'}
        </h1>
        <form onSubmit={(e) => {
          e.preventDefault();
          const searchInput = document.getElementById('item-search');
          if (searchInput && searchInput.value.trim() !== '') {
            const urlParams = new URLSearchParams();
            urlParams.set('searchTerm', searchInput.value);
            navigate(`/items?${urlParams.toString()}`);
          }
        }} className="flex w-full md:w-auto">
          <TextInput
            id="item-search"
            type="text"
            placeholder="Search supplies..."
            defaultValue={new URLSearchParams(location.search).get('searchTerm') || ''}
            className="flex-1 min-w-[200px]"
          />
          <Button type="submit" color="blue" className="ml-2">
            <FaSearch className="mr-2" />
            Search
          </Button>
        </form>
      </div>

      {/* Search Term Display */}
      {location.search && new URLSearchParams(location.search).get('searchTerm') && (
        <p className="mb-6 text-gray-600 dark:text-gray-400">
          Showing results for: "{new URLSearchParams(location.search).get('searchTerm')}"
        </p>
      )}
      
      {/* Mock Data Notification */}
      {usedMockData && (
        <Alert color="info" icon={HiInformationCircle} className="mb-4">
          <span className="font-medium">Dev Mode:</span> Using mock data because API connection failed. The data shown is for development purposes only.
        </Alert>
      )}
      
      {error && !usedMockData && (
        <Alert color="failure" icon={HiInformationCircle} className="mb-4">
          <span className="font-medium">Error:</span> {error}
        </Alert>
      )}

      {/* Debug Info - Only visible in development */}
      {process.env.NODE_ENV === 'development' && error && !usedMockData && (
        <div className="mb-4 p-3 border border-gray-300 rounded bg-gray-50 dark:bg-gray-800 dark:border-gray-700">
          <h3 className="text-sm font-semibold mb-1">Debug Information</h3>
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
            API URL: {location.search ? `/api/items?search=${new URLSearchParams(location.search).get('searchTerm')}` : '/api/items'}
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            Check your browser console for more detailed error logs.
          </p>
        </div>
      )}

      {/* Item Details Section (Upper Half) */}
      <div className="mb-8">
        {selectedItem && typeof selectedItem === 'object' ? (
          <Card className="p-2">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="flex justify-center items-center">
                {(() => {
                  // Debugging image URL
                  console.log('Item picturePath:', selectedItem?.picturePath);
                  
                  // Check if picturePath exists, is a string, and is a valid URL
                  const hasValidImageUrl = selectedItem?.picturePath && 
                    typeof selectedItem.picturePath === 'string' && 
                    (selectedItem.picturePath.startsWith('http://') || 
                    selectedItem.picturePath.startsWith('https://')) &&
                    selectedItem.picturePath !== window.location.href;
                  
                  // Use picturePath if valid, or default image
                  const imageUrl = hasValidImageUrl ? selectedItem.picturePath : DEFAULT_IMAGE;
                  
                  console.log('Using image URL:', imageUrl);
                  
                  return (
                    <img 
                      src={imageUrl} 
                      alt={selectedItem.name || 'Item'} 
                      className="max-h-48 object-contain"
                      onError={(e) => {
                        console.log('Image failed to load:', e.target.src);
                        e.target.onerror = null; 
                        // If the default image also fails, show a plain background
                        if (e.target.src !== DEFAULT_IMAGE) {
                          e.target.src = DEFAULT_IMAGE;
                        } else {
                          e.target.src = ''; 
                          const parentElement = e.target.parentNode;
                          if (parentElement) {
                            parentElement.innerHTML = '';
                            parentElement.classList.add('bg-gray-200', 'dark:bg-gray-700', 'h-48', 'w-full', 'flex', 'justify-center', 'items-center', 'rounded');
                            const span = document.createElement('span');
                            span.className = 'text-gray-500 dark:text-gray-400';
                            span.textContent = 'Image Error';
                            parentElement.appendChild(span);
                          }
                        }
                      }}
                    />
                  );
                })()}
              </div>
              <div className="md:col-span-2">
                <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">{selectedItem.name || 'Unnamed Item'}</h2>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-gray-700 dark:text-gray-300"><span className="font-medium">Category:</span> {selectedItem.category || 'Uncategorized'}</p>
                    <p className="text-gray-700 dark:text-gray-300"><span className="font-medium">Current Stock:</span> {selectedItem.currentStock != null ? selectedItem.currentStock : 'Unknown'}</p>
                    <p className="text-gray-700 dark:text-gray-300"><span className="font-medium">Low Stock Threshold:</span> {selectedItem.reorderThreshold != null ? selectedItem.reorderThreshold : 'Not set'}</p>
                  </div>
                  <div>
                    <p className="text-gray-700 dark:text-gray-300"><span className="font-medium">Location:</span> {selectedItem.location || 'Not specified'}</p>
                    <p className="text-gray-700 dark:text-gray-300">
                      <span className="font-medium">Last Updated:</span> {
                        selectedItem.lastUpdated 
                          ? new Date(selectedItem.lastUpdated).toLocaleDateString() 
                          : 'Unknown'
                      }
                    </p>
                    <p className={`font-medium ${
                      selectedItem.currentStock != null && selectedItem.reorderThreshold != null && selectedItem.currentStock <= selectedItem.reorderThreshold 
                        ? 'text-red-600 dark:text-red-400' 
                        : 'text-green-600 dark:text-green-400'
                    }`}>
                      {
                        selectedItem.currentStock != null && selectedItem.reorderThreshold != null && selectedItem.currentStock <= selectedItem.reorderThreshold 
                          ? 'Low Stock!' 
                          : 'Stock Level OK'
                      }
                    </p>
                  </div>
                </div>
                <p className="mt-4 text-gray-700 dark:text-gray-300">
                  <span className="font-medium">Description:</span> {selectedItem.description || 'No description available'}
                </p>
                <div className="mt-4 flex gap-2">
                  {selectedItem._id && (
                    <>
                      <Button 
                        color="blue" 
                        size="sm" 
                        as={Link} 
                        to={`/add-stock?itemId=${selectedItem._id}`}
                      >
                        Add Stock
                      </Button>
                      <Button 
                        color="purple" 
                        size="sm" 
                        as={Link}
                        to={`/use-stock?itemId=${selectedItem._id}`}
                      >
                        Use Stock
                      </Button>
                      {currentUser?.isAdmin && (
                        <Button 
                          color="yellow" 
                          size="sm" 
                          as={Link} 
                          to={`/update-item/${selectedItem._id}`}
                        >
                          Edit Item
                        </Button>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          </Card>
        ) : (
          <Card>
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              <p>No item selected. Please select an item from the list below.</p>
            </div>
          </Card>
        )}
      </div>

      {/* Items List Section (Lower Half) */}
      <div className="overflow-x-auto">
        <Table hoverable>
          <Table.Head className="bg-gray-50 dark:bg-gray-700">
            <Table.HeadCell className="text-gray-900 dark:text-white">Item Name</Table.HeadCell>
            <Table.HeadCell className="text-gray-900 dark:text-white">Category</Table.HeadCell>
            <Table.HeadCell className="text-gray-900 dark:text-white">Current Stock</Table.HeadCell>
            <Table.HeadCell className="text-gray-900 dark:text-white">Status</Table.HeadCell>
            <Table.HeadCell className="text-gray-900 dark:text-white">
              <span className="sr-only">View</span>
            </Table.HeadCell>
          </Table.Head>
          <Table.Body className="divide-y">
            {items.length > 0 ? (
              items.map((item, index) => {
                // Validate item object exists and has required properties
                if (!item || typeof item !== 'object') {
                  return null;
                }
                
                return (
                  <Table.Row 
                    key={item._id || `item-${index}`} 
                    className={`${selectedItem?._id === item._id ? 'bg-blue-50 dark:bg-gray-700' : 'bg-white dark:bg-gray-800'} dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 cursor-pointer`}
                    onClick={() => handleSelectItem(item)}
                  >
                    <Table.Cell className="font-medium text-gray-900 dark:text-white">
                      {item.name || 'Unnamed Item'}
                    </Table.Cell>
                    <Table.Cell>{item.category || 'Uncategorized'}</Table.Cell>
                    <Table.Cell>{item.currentStock != null ? item.currentStock : 'Unknown'}</Table.Cell>
                    <Table.Cell>
                      {item.currentStock != null && item.reorderThreshold != null ? (
                        <span className={`px-2 py-1 rounded-full text-xs ${item.currentStock <= item.reorderThreshold ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'}`}>
                          {item.currentStock <= item.reorderThreshold ? 'Low Stock' : 'In Stock'}
                        </span>
                      ) : (
                        <span className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                          Unknown
                        </span>
                      )}
                    </Table.Cell>
                    <Table.Cell>
                      <Button color="light" size="xs" onClick={(e) => {
                        e.stopPropagation();
                        handleSelectItem(item);
                      }}>
                        View Details
                      </Button>
                    </Table.Cell>
                  </Table.Row>
                );
              })
            ) : (
              <Table.Row className="bg-white dark:bg-gray-800 dark:border-gray-700">
                <Table.Cell colSpan={5} className="text-center py-4">
                  {location.search && new URLSearchParams(location.search).get('searchTerm') ? (
                    <>
                      <p className="text-gray-500 dark:text-gray-400">No items found matching your search</p>
                      <Button color="blue" size="xs" as={Link} to="/items" className="mt-2">
                        View All Items
                      </Button>
                    </>
                  ) : (
                    <>
                      <p className="text-gray-500 dark:text-gray-400">No items found</p>
                      {currentUser?.isAdmin && (
                        <Button color="blue" size="xs" as={Link} to="/create-item" className="mt-2">
                          Create New Supply
                        </Button>
                      )}
                    </>
                  )}
                </Table.Cell>
              </Table.Row>
            )}
          </Table.Body>
        </Table>
      </div>
    </div>
  );
} 