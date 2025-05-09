import React from 'react';
import DataCard from './DataCard';

/**
 * Component to display a grid of BLS data cards
 */
const DataGrid = ({ filteredData, activeTab }) => {
  // Debug the received data
  console.log(`DataGrid render - Tab: ${activeTab}, Data count: ${filteredData.length}`);
  
  // Check if we have any data to display
  if (filteredData.length === 0) {
    return (
      <div className="no-data-container">
        <p className="no-data">
          {activeTab === 'national' 
            ? "No national data available. Please check your API key and connection."
            : "No data matches your current filters. Please select a state to view its data."}
        </p>
      </div>
    );
  }

  return (
    <div className="data-grid">
      {filteredData.map((item, index) => (
        <DataCard
          key={`${item.id}-${item.year}-${item.period}-${index}`}
          item={item}
        />
      ))}
    </div>
  );
};

export default DataGrid; 