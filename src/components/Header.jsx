import React from 'react';

/**
 * Header component with app title and navigation tabs
 */
const Header = ({ activeTab, setActiveTab, allSeriesLoaded = true }) => {
  
  // Get appropriate helper text based on the active tab
  const getTabHelperText = () => {
    switch(activeTab) {
      case 'national':
        return "Showing summary statistics for national indicators. Click 'Show Detailed BLS Data' to view the detailed records.";
      case 'states':
        return "Select a state from the filters to view its unemployment rate and nonfarm employment data. The data will load when you select a state.";
      default:
        const loadingMessage = !allSeriesLoaded 
          ? " Note: Some key indicators may still be loading." 
          : "";
        return "Showing statistics for key National indicators. Select a state from the filters to view state-specific data." + loadingMessage;
    }
  };
  
  return (
    <header>
      <h1>Bureau of Labor Statistics Data Explorer</h1>
      <p className="subtitle">Explore economic indicators from the U.S. Bureau of Labor Statistics</p>
      <p className="info-note">
        {getTabHelperText()}
      </p>
      
      <div className="data-tabs">
        <button 
          className={activeTab === 'all' ? 'active' : ''} 
          onClick={() => setActiveTab('all')}
        >
          All Data
        </button>
        <button 
          className={activeTab === 'national' ? 'active' : ''} 
          onClick={() => setActiveTab('national')}
        >
          National Data
        </button>
        <button 
          className={activeTab === 'states' ? 'active' : ''} 
          onClick={() => setActiveTab('states')}
        >
          State Data
        </button>
      </div>
    </header>
  );
};

export default Header; 