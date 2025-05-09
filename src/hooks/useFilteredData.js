import { useState, useMemo } from 'react';
import { calculateMultiSeriesStatistics } from '../utils/statistics';

/**
 * Custom hook for filtering and searching BLS data
 * @param {Array} blsData - Array of BLS data points
 * @param {string} activeTab - Current active tab (all, national, states)
 * @returns {Object} - Filtered data, search state, filter state, and handlers
 */
function useFilteredData(blsData, activeTab) {
  // Initial filter state
  const initialFilters = {
    category: 'all',
    subcategory: activeTab === 'states' ? 'Florida' : 'all',
    year: 'all',
    period: 'all',
  };

  // Search and filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState(initialFilters);

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
    const years = [...new Set(blsData.map((item) => item.year))];
    const periods = [...new Set(blsData.map((item) => item.period))];

    return { categories, subcategories, years, periods };
  }, [blsData, activeTab]);

  // Apply filters and search to data
  const filteredData = useMemo(() => {
    // First apply all filters
    const filtered = blsData.filter((item) => {
      // Search across multiple fields
      const matchesSearch =
        searchTerm === '' ||
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.value.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.periodName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.year.toLowerCase().includes(searchTerm.toLowerCase());

      // Apply categorical filters
      const matchesCategory = filters.category === 'all' || 
        (activeTab === 'states' 
          ? (filters.category === 'Unemployment rate' 
              ? item.category === 'State Data'
              : filters.category === 'nonfarm employment' 
                ? item.name === 'Total Nonfarm Employment'
                : true)
          : item.category === filters.category);
      const matchesSubcategory = filters.subcategory === 'all' || 
        (activeTab === 'states' && filters.category === 'Unemployment rate'
          ? item.name.startsWith(filters.subcategory)
          : true);
      const matchesYear = filters.year === 'all' || item.year === filters.year;
      const matchesPeriod = filters.period === 'all' || item.period === filters.period;

      return matchesSearch && matchesCategory && matchesSubcategory && matchesYear && matchesPeriod;
    });

    // Sort by year and period (most recent first)
    const sorted = filtered.sort((a, b) => {
      // First compare years
      const yearCompare = parseInt(b.year) - parseInt(a.year);
      if (yearCompare !== 0) return yearCompare;
      
      // If years are equal, compare periods (M01 to M12)
      const periodA = parseInt(a.period.replace('M', ''));
      const periodB = parseInt(b.period.replace('M', ''));
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
  }, [blsData, searchTerm, filters]);

  // Calculate statistics for the filtered data
  const statistics = useMemo(() => {
    return calculateMultiSeriesStatistics(filteredData);
  }, [filteredData]);

  // Reset all filters to their initial state
  const resetFilters = () => {
    setSearchTerm('');
    setFilters(initialFilters);
  };

  // Event handlers
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleFilterChange = (filterType, value) => {
    setFilters((prev) => ({
      ...prev,
      [filterType]: value,
    }));
  };

  return {
    filteredData,
    searchTerm,
    filters,
    filterOptions,
    statistics,
    handleSearchChange,
    handleFilterChange,
    resetFilters,
  };
}

export default useFilteredData; 