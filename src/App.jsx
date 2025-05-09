import React, { useState, useEffect, useMemo } from 'react';
import './styles/main.css';

// Custom hooks
import useBlsData from './hooks/useBlsData';
import { calculateMultiSeriesStatistics } from './utils/statistics';

// Components
import Header from './components/Header';
import SearchAndFilter from './components/SearchAndFilter';
import StatisticsPanel from './components/StatisticsPanel';
import DataGrid from './components/DataGrid';
import ErrorMessage from './components/ErrorMessage';
import LoadingSpinner from './components/LoadingSpinner';

/**
 * Main application component for BLS Data Explorer
 */
function App() {
  // State for managing tab and pagination
  const [activeTab, setActiveTab] = useState('all');
  // Start with visibleStates=0 to only show Florida initially
  const [visibleStates, setVisibleStates] = useState(0);
  // State to control whether to show the data grid
  const [showDataGrid, setShowDataGrid] = useState(false);
  // State for filters
  const [filters, setFilters] = useState({
    category: 'all',
    subcategory: activeTab === 'states' ? 'Florida' : 'all',
    year: 'all',
    period: 'all',
  });
  // State for search term
  const [searchTerm, setSearchTerm] = useState('');
  // State for actual search query (only updated when search button is clicked)
  const [searchQuery, setSearchQuery] = useState('');
  
  // Load API key from .env file
  const apiKey = import.meta.env.VITE_BLS_API_KEY;
  
  // Fetch BLS data using custom hook
  const { 
    blsData, 
    loading, 
    error, 
    seriesErrors 
  } = useBlsData(apiKey, activeTab, visibleStates, filters);
  
  // Debug the BLS data when it changes
  useEffect(() => {
    console.log(`Data loaded for tab: ${activeTab}, Total records: ${blsData.length}`);
    // Show data categories that were loaded
    const categories = [...new Set(blsData.map(item => item.category))];
    console.log(`Categories loaded: ${categories.join(', ')}`);
    
    // Check for specific indicators
    const seriesNames = [...new Set(blsData.map(item => item.name))];
    console.log(`Series loaded: ${seriesNames.join(', ')}`);
    
    // Specifically check for CPI
    const hasCPI = blsData.some(item => item.name.includes('Consumer Price Index'));
    console.log(`CPI data loaded: ${hasCPI ? 'Yes' : 'No'}`);
  }, [blsData, activeTab]);
  
  // Generate filter options from available data
  const filterOptions = useMemo(() => {
    // For state tab, only show Unemployment rate and nonfarm employment
    const categories = activeTab === 'states' 
      ? ['Unemployment rate', 'nonfarm employment']
      : [...new Set(blsData.map((item) => item.category))];
      
    const subcategories = [...new Set(
      blsData
        .filter(item => item.category === 'State Data')
        .map(item => item.name.replace(' Unemployment Rate', ''))
        .sort()
    )];
    const years = [...new Set(blsData.map((item) => item.year || ''))];
    const periods = [...new Set(blsData.map((item) => item.period || ''))];

    return { categories, subcategories, years, periods };
  }, [blsData, activeTab]);
  
  // Apply filters and search to data
  const filteredData = useMemo(() => {
    // First apply all filters
    const filtered = blsData.filter((item) => {
      // Search across multiple fields
      const matchesSearch =
        searchQuery === '' ||
        (item.name && item.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.value && item.value.toString().toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.periodName && item.periodName.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.year && item.year.toString().toLowerCase().includes(searchQuery.toLowerCase()));

      // Apply categorical filters
      const matchesCategory = filters.category === 'all' || 
        (activeTab === 'states' 
          ? (filters.category === 'Unemployment rate' 
              ? item.name && item.name.includes('Unemployment Rate')
              : filters.category === 'nonfarm employment' 
                ? item.name && item.name.includes('Total Nonfarm Employment')
                : true)
          : item.category === filters.category);
      const matchesSubcategory = filters.subcategory === 'all' || 
        (activeTab === 'states'
          ? (item.name && item.name.startsWith(filters.subcategory))
          : true);
      const matchesYear = filters.year === 'all' || (item.year && item.year === filters.year);
      const matchesPeriod = filters.period === 'all' || (item.period && item.period === filters.period);

      return matchesSearch && matchesCategory && matchesSubcategory && matchesYear && matchesPeriod;
    });

    // Sort by year and period (most recent first)
    const sorted = filtered.sort((a, b) => {
      // First compare years
      const yearCompare = parseInt(b.year || '0') - parseInt(a.year || '0');
      if (yearCompare !== 0) return yearCompare;
      
      // If years are equal, compare periods (M01 to M12)
      const periodA = parseInt((a.period || 'M0').replace('M', ''));
      const periodB = parseInt((b.period || 'M0').replace('M', ''));
      return periodB - periodA;
    });

    // Group by series name to get 5 most recent for each series
    const groupedBySeries = sorted.reduce((acc, item) => {
      if (!acc[item.name]) {
        acc[item.name] = [];
      }
      if (acc[item.name].length < 5) {
        acc[item.name].push(item);
      }
      return acc;
    }, {});

    // Flatten the grouped data back into an array
    return Object.values(groupedBySeries).flat();
  }, [blsData, searchQuery, filters, activeTab]);
  
  // Calculate statistics for the filtered data
  const statistics = useMemo(() => {
    return calculateMultiSeriesStatistics(filteredData);
  }, [filteredData]);
  
  // Reset all filters to their initial state
  const resetFilters = () => {
    setSearchTerm('');
    setSearchQuery('');
    setFilters({
      category: 'all',
      subcategory: activeTab === 'states' ? 'Florida' : 'all',
      year: 'all',
      period: 'all',
    });
  };
  
  // Handle filter change
  const handleFilterChange = (filterType, value) => {
    if (filterType === 'subcategory' && activeTab === 'states') {
      // When changing state, reset other filters and ensure data is loaded
      setFilters({
        category: 'all',
        subcategory: value,
        year: 'all',
        period: 'all'
      });
      setShowDataGrid(true);
      setVisibleStates(prev => prev === 0 ? 10 : prev);
    } else {
      // Normal filter updates
      setFilters(prev => ({
        ...prev,
        [filterType]: value
      }));
    }
  };
  
  // Handle search change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSearchSubmit = () => {
    setSearchQuery(searchTerm);
    
    // If we're on the states tab or if the search looks like a state name,
    // try to match it to a state
    const stateNames = [...new Set(blsData
      .filter(series => series.name.includes('Unemployment Rate'))
      .map(state => state.name.replace(' Unemployment Rate', ''))
      .sort()
    )];
    
    // Find the closest matching state name (case insensitive)
    const matchingState = stateNames.find(state => 
      state.toLowerCase().includes(searchTerm.toLowerCase()) ||
      searchTerm.toLowerCase().includes(state.toLowerCase())
    );
    
    if (matchingState) {
      // First update the filters
      setFilters({
        category: 'all',
        subcategory: matchingState,
        year: 'all',
        period: 'all'
      });
      
      // Then switch to states tab if not already there
      if (activeTab !== 'states') {
        setActiveTab('states');
      }
      
      // Ensure data grid is visible
      setShowDataGrid(true);
      
      // Set visible states to ensure data is fetched
      setVisibleStates(prev => prev === 0 ? 10 : prev);
    }
  };
  
  // Handle loading more states
  const loadMoreStates = () => {
    // First load will show 10 states (including Florida)
    setVisibleStates(prev => prev === 0 ? 10 : prev + 10);
    // Show data grid when loading more states
    setShowDataGrid(true);
  };
  
  // Handle tab change with proper state updates
  const handleTabChange = (tab) => {
    console.log(`Changing tab from ${activeTab} to ${tab}`);
    setActiveTab(tab);
    
    // Only reset filters if we're not coming from a state search
    if (!searchTerm) {
      // Reset filters when changing tabs
      resetFilters();
      
      // Set appropriate visibility based on tab
      if (tab === 'states') {
        // Reset to Florida data view when switching to states tab
        setVisibleStates(0);
        // Set default state to Florida
        setFilters({
          category: 'all',
          subcategory: 'Florida',
          year: 'all',
          period: 'all',
        });
        // Don't automatically show data grid for any tab
        setShowDataGrid(false);
      } else if (tab === 'national') {
        // Don't automatically show data grid for any tab
        setFilters({
          category: 'all',
          subcategory: 'all',
          year: 'all',
          period: 'all',
        });
        setShowDataGrid(false);
      } else {
        // Default for 'all' tab
        setFilters({
          category: 'all',
          subcategory: 'all',
          year: 'all',
          period: 'all',
        });
      }
    }
  };
  
  // Show loading spinner during data fetch
  if (loading) {
    return <LoadingSpinner />;
  }
  
  // Always hide data grid by default, regardless of tab
  const shouldShowDataGrid = showDataGrid;
  
  // Calculate some key statistics for the header
  const requiredSeries = ['National Unemployment Rate', 'Consumer Price Index', 'Producer Price Index'];
  const allSeriesLoaded = requiredSeries.every(seriesName => 
    filteredData.some(item => item.name.includes(seriesName))
  );
  
  return (
    <div className="app-container">
      <Header 
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        allSeriesLoaded={allSeriesLoaded}
      />
      
      <ErrorMessage 
        error={error}
        seriesErrors={seriesErrors}
      />
      
      {!error && (
        <>
          <SearchAndFilter
            searchTerm={searchTerm}
            filters={filters}
            filterOptions={filterOptions}
            handleSearchChange={handleSearchChange}
            handleSearchSubmit={handleSearchSubmit}
            handleFilterChange={handleFilterChange}
            activeTab={activeTab}
          />
          
          <StatisticsPanel 
            statistics={statistics}
          />
          
          {!shouldShowDataGrid ? (
            <div className="show-data-container">
              <button 
                className="show-data-button" 
                onClick={() => setShowDataGrid(true)}
              >
                Show Detailed BLS Data ({filteredData.length} records)
              </button>
              <p className="data-tip">
                Click to view detailed data records. You can also use the search and filters above to narrow down results first.
              </p>
            </div>
          ) : (
            <div className="data-container">
              <div className="data-header-row">
                <h2>BLS Data ({filteredData.length} records)</h2>
                <button 
                  className="hide-data-button" 
                  onClick={() => setShowDataGrid(false)}
                >
                  Hide Data Grid
                </button>
              </div>
              
              <DataGrid
                filteredData={filteredData}
                activeTab={activeTab}
                visibleStates={visibleStates}
                loadMoreStates={loadMoreStates}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default App;