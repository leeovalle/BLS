import React from 'react';
import { stateData } from '../data/blsSeriesData';

/**
 * Search and filter controls for BLS data
 */
const SearchAndFilter = ({ 
  searchTerm, 
  filters, 
  filterOptions, 
  handleSearchChange,
  handleSearchSubmit,
  handleFilterChange,
  activeTab
}) => {
  // Get unique state names from stateData, removing any additional text
  const stateNames = [...new Set(stateData
    .filter(series => series.name.includes('Unemployment Rate'))
    .map(state => state.name.replace(' Unemployment Rate', ''))
    .sort()
  )];

  // Ensure we always have category options
  const categoryOptions = activeTab === 'states' 
    ? ['Unemployment rate', 'nonfarm employment']
    : (filterOptions.categories || []);

  // Handle Enter key in search input
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearchSubmit();
    }
  };

  // Handle input change with immediate feedback
  const handleInputChange = (e) => {
    handleSearchChange(e);
    
    // If it looks like a state name and we're not on the states tab,
    // show a message or handle accordingly
    const searchValue = e.target.value.toLowerCase();
    const matchingState = stateNames.find(state => 
      state.toLowerCase().includes(searchValue) ||
      searchValue.includes(state.toLowerCase())
    );
  };

  return (
    <div className="controls">
      <div className="search-container">
        <input
          type="text"
          placeholder={activeTab === 'states' ? "Search by state name (e.g. Florida, Texas)..." : "Search data..."}
          value={searchTerm}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          className="search-input"
          autoComplete="off"
        />
        <button
          onClick={handleSearchSubmit}
          className="search-button"
        >
          Search
        </button>
      </div>

      <div className="filters">
        <div className="filter">
          <label>Category:</label>
          <select
            value={filters.category}
            onChange={(e) => handleFilterChange('category', e.target.value)}
          >
            <option value="all">All Categories</option>
            {categoryOptions.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        {activeTab === 'states' && (
          <div className="filter">
            <label>State:</label>
            <select
              value={filters.subcategory}
              onChange={(e) => handleFilterChange('subcategory', e.target.value)}
              className="filter-select"
            >
              {stateNames.map((state) => (
                <option key={state} value={state}>
                  {state}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="filter">
          <label>Year:</label>
          <select
            value={filters.year}
            onChange={(e) => handleFilterChange('year', e.target.value)}
          >
            <option value="all">All Years</option>
            {(filterOptions.years || []).map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>

        <div className="filter">
          <label>Period:</label>
          <select
            value={filters.period}
            onChange={(e) => handleFilterChange('period', e.target.value)}
          >
            <option value="all">All Periods</option>
            {(filterOptions.periods || []).map((period) => (
              <option key={period} value={period}>
                {period.replace('M', 'Month ')}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default SearchAndFilter; 