import React from 'react';

/**
 * Component to display a loading spinner
 */
const LoadingSpinner = () => {
  return (
    <div className="loading-container">
      <div className="loading-spinner"></div>
      <p>Loading BLS data...</p>
    </div>
  );
};

export default LoadingSpinner; 