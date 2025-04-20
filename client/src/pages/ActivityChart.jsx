import { useState, useEffect, useRef } from 'react';
import { Card, Label, Button, Spinner, Checkbox, TextInput } from 'flowbite-react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import { format, subDays } from 'date-fns';
import { useSelector } from 'react-redux';

export default function ActivityChart() {
  const [startDate, setStartDate] = useState(format(subDays(new Date(), 30), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [items, setItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState({});
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState({});
  const [chartOptions, setChartOptions] = useState({});
  const chartRef = useRef(null);
  
  // Get current theme from Redux
  const { theme } = useSelector((state) => state.theme);

  // Color palettes for light and dark themes
  const colorPalettes = {
    light: [
      '#3b82f6', // blue
      '#ef4444', // red
      '#10b981', // green
      '#f59e0b', // amber
      '#8b5cf6', // purple
      '#ec4899', // pink
      '#06b6d4', // cyan
      '#84cc16', // lime
      '#f97316', // orange
      '#6366f1', // indigo
      '#14b8a6', // teal
      '#a855f7', // violet
      '#0ea5e9', // sky
      '#d946ef', // fuchsia
      '#22c55e', // emerald
      '#eab308', // yellow
    ],
    dark: [
      '#60a5fa', // brighter blue
      '#f87171', // brighter red
      '#34d399', // brighter green
      '#fbbf24', // brighter amber
      '#a78bfa', // brighter purple
      '#f472b6', // brighter pink
      '#22d3ee', // brighter cyan
      '#a3e635', // brighter lime
      '#fb923c', // brighter orange
      '#818cf8', // brighter indigo
      '#2dd4bf', // brighter teal
      '#c084fc', // brighter violet
      '#38bdf8', // brighter sky
      '#e879f9', // brighter fuchsia
      '#4ade80', // brighter emerald
      '#facc15', // brighter yellow
    ]
  };

  // Fetch all items for the checkboxes
  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await fetch('/api/items');
        const data = await response.json();
        
        // Handle the data format where items may be wrapped in an 'items' property
        const itemsArray = Array.isArray(data) ? data : 
                         Array.isArray(data.items) ? data.items : [];
        
        setItems(itemsArray);
        
        // Initialize all items as selected (true)
        const itemSelections = {};
        itemsArray.forEach(item => {
          itemSelections[item._id] = true;
        });
        setSelectedItems(itemSelections);
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching items:', error);
        setLoading(false);
      }
    };
    
    fetchItems();
  }, []);

  // Function to handle checkbox changes
  const handleItemSelect = (itemId) => {
    setSelectedItems(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };

  // Function to toggle all checkboxes
  const toggleAllItems = () => {
    const allSelected = Object.values(selectedItems).every(value => value);
    const newState = {};
    
    items.forEach(item => {
      newState[item._id] = !allSelected;
    });
    
    setSelectedItems(newState);
  };

  // Fetch data and update chart when filters change or theme changes
  useEffect(() => {
    const fetchActivityData = async () => {
      if (loading || items.length === 0) return;
      
      setLoading(true);
      
      try {
        // Fetch stock additions
        const stockResponse = await fetch(`/api/stock?startDate=${startDate}&endDate=${endDate}`, {
          credentials: 'include'
        });
        const stockData = await stockResponse.json();
        
        // Fetch stock usage
        const usageResponse = await fetch(`/api/stockUsage?startDate=${startDate}&endDate=${endDate}`, {
          credentials: 'include'
        });
        const usageData = await usageResponse.json();
        
        // Process the data for the chart
        processChartData(stockData, usageData);
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching activity data:', error);
        setLoading(false);
      }
    };
    
    fetchActivityData();
  }, [startDate, endDate, selectedItems, items.length, theme]); // Added theme to dependencies
  
  // Process the fetched data for the chart
  const processChartData = (stockData, usageData) => {
    // Create a map of dates to easily aggregate data
    const dateMap = new Map();
    const itemsMap = new Map();
    const uniqueItemIds = new Set(); // Track all unique item IDs
    
    // Map items for quick lookup
    items.forEach(item => {
      itemsMap.set(item._id, item);
    });
    
    // Process stock additions
    stockData.forEach(stock => {
      const itemId = stock.item._id || stock.item;
      if (!selectedItems[itemId]) return;
      
      uniqueItemIds.add(itemId);
      
      const date = new Date(stock.createdAt || stock.dateAdded);
      const dateStr = format(date, 'yyyy-MM-dd');
      
      if (!dateMap.has(dateStr)) {
        dateMap.set(dateStr, {});
      }
      
      const itemName = itemsMap.get(itemId)?.name || 'Unknown Item';
      
      if (!dateMap.get(dateStr)[`${itemName} (Added)`]) {
        dateMap.get(dateStr)[`${itemName} (Added)`] = 0;
      }
      
      dateMap.get(dateStr)[`${itemName} (Added)`] += stock.quantity;
    });
    
    // Process stock usage
    usageData.forEach(usage => {
      const itemId = usage.item._id || usage.item;
      if (!selectedItems[itemId]) return;
      
      uniqueItemIds.add(itemId);
      
      const date = new Date(usage.createdAt || usage.dateAdded);
      const dateStr = format(date, 'yyyy-MM-dd');
      
      if (!dateMap.has(dateStr)) {
        dateMap.set(dateStr, {});
      }
      
      const itemName = itemsMap.get(itemId)?.name || 'Unknown Item';
      
      if (!dateMap.get(dateStr)[`${itemName} (Used)`]) {
        dateMap.get(dateStr)[`${itemName} (Used)`] = 0;
      }
      
      dateMap.get(dateStr)[`${itemName} (Used)`] += usage.quantity;
    });
    
    // Convert the data to Highcharts series format
    const seriesMap = new Map();
    const categories = Array.from(dateMap.keys()).sort();
    
    categories.forEach(date => {
      const dayData = dateMap.get(date);
      
      Object.entries(dayData).forEach(([key, value]) => {
        if (!seriesMap.has(key)) {
          seriesMap.set(key, {
            name: key,
            data: Array(categories.length).fill(0)
          });
        }
        
        const index = categories.indexOf(date);
        seriesMap.get(key).data[index] = value;
      });
    });
    
    // Assign colors to items
    const colorPalette = colorPalettes[theme];
    const itemColors = new Map(); // Map to track colors for each item
    
    // Assign colors to unique items
    Array.from(uniqueItemIds).forEach((itemId, index) => {
      // Use modulo to cycle through the color palette if we have more items than colors
      const colorIndex = index % colorPalette.length;
      itemColors.set(itemId, colorPalette[colorIndex]);
    });
    
    // Create the chart options with theme-specific styling
    const options = {
      chart: {
        type: 'line',
        zoomType: 'x',
        backgroundColor: theme === 'dark' ? '#1a202c' : '#ffffff',
        style: {
          fontFamily: '-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica, Arial, sans-serif'
        }
      },
      title: {
        text: 'Stock Activity Chart',
        style: {
          color: theme === 'dark' ? '#e2e8f0' : '#1a202c'
        }
      },
      subtitle: {
        text: `${startDate} to ${endDate}`,
        style: {
          color: theme === 'dark' ? '#a0aec0' : '#4a5568'
        }
      },
      xAxis: {
        categories: categories,
        crosshair: true,
        labels: {
          rotation: -45,
          style: {
            color: theme === 'dark' ? '#a0aec0' : '#4a5568'
          }
        },
        lineColor: theme === 'dark' ? '#4a5568' : '#e2e8f0',
        tickColor: theme === 'dark' ? '#4a5568' : '#e2e8f0'
      },
      yAxis: {
        title: {
          text: 'Quantity',
          style: {
            color: theme === 'dark' ? '#a0aec0' : '#4a5568'
          }
        },
        min: 0,
        gridLineColor: theme === 'dark' ? '#2d3748' : '#edf2f7',
        labels: {
          style: {
            color: theme === 'dark' ? '#a0aec0' : '#4a5568'
          }
        }
      },
      tooltip: {
        shared: true,
        backgroundColor: theme === 'dark' ? '#2d3748' : '#ffffff',
        borderColor: theme === 'dark' ? '#4a5568' : '#e2e8f0',
        style: {
          color: theme === 'dark' ? '#e2e8f0' : '#1a202c'
        }
      },
      legend: {
        itemStyle: {
          color: theme === 'dark' ? '#e2e8f0' : '#1a202c'
        },
        itemHoverStyle: {
          color: theme === 'dark' ? '#ffffff' : '#000000'
        }
      },
      plotOptions: {
        line: {
          marker: {
            enabled: false
          }
        }
      },
      credits: {
        style: {
          color: theme === 'dark' ? '#a0aec0' : '#718096'
        }
      },
      series: Array.from(seriesMap.values()).map(series => {
        // Extract item name and action type from series name (e.g., "Item A (Added)")
        const [itemName, actionType] = series.name.match(/(.+) \((Added|Used)\)$/).slice(1);
        
        // Find itemId for this name
        let itemId = null;
        for (const [id, item] of itemsMap.entries()) {
          if (item.name === itemName) {
            itemId = id;
            break;
          }
        }
        
        // Set the color based on item ID and apply a different dash style for "Used" series
        const isUsage = actionType === 'Used';
        
        return {
          ...series,
          color: itemId ? itemColors.get(itemId) : (isUsage ? '#7f9cf5' : '#48bb78'),
          dashStyle: isUsage ? 'ShortDash' : 'Solid'
        };
      })
    };
    
    setChartOptions(options);
  };

  return (
    <div className="p-3 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold my-6 text-center dark:text-white">
        Activity Chart
      </h1>
      
      <Card className="mb-6">
        <h5 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
          Chart Filters
        </h5>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <div className="mb-2 block">
              <Label htmlFor="startDate" value="Start Date" />
            </div>
            <TextInput
              id="startDate"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          
          <div>
            <div className="mb-2 block">
              <Label htmlFor="endDate" value="End Date" />
            </div>
            <TextInput
              id="endDate"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>
        
        <div className="mb-4">
          <div className="mb-2 flex justify-between items-center">
            <Label value="Select Items" />
            <Button size="xs" onClick={toggleAllItems}>
              {Object.values(selectedItems).every(v => v) ? 'Deselect All' : 'Select All'}
            </Button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 max-h-60 overflow-y-auto p-2 border border-gray-200 rounded-lg dark:border-gray-700">
            {items.map((item) => (
              <div key={item._id} className="flex items-center gap-2">
                <Checkbox
                  id={`item-${item._id}`}
                  checked={selectedItems[item._id] || false}
                  onChange={() => handleItemSelect(item._id)}
                />
                <Label htmlFor={`item-${item._id}`} className="cursor-pointer">
                  {item.name}
                </Label>
              </div>
            ))}
            
            {items.length === 0 && <p className="text-gray-500">No items available</p>}
          </div>
        </div>
      </Card>
      
      <Card className="overflow-x-auto">
        {loading ? (
          <div className="flex justify-center items-center p-8">
            <Spinner size="xl" />
          </div>
        ) : (
          <div className="min-h-[400px]">
            {chartOptions.series && chartOptions.series.length > 0 ? (
              <HighchartsReact
                highcharts={Highcharts}
                options={chartOptions}
                ref={chartRef}
              />
            ) : (
              <div className="flex justify-center items-center h-[400px] text-gray-500">
                No data available for the selected filters
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
} 