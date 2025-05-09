import React from 'react';

/**
 * Component to display error messages
 */
const ErrorMessage = ({ error, seriesErrors }) => {
  if (!error) {
    return null;
  }

  return (
    <div className="error-message">
      <h2>Error</h2>
      <p>{error}</p>
      
      {seriesErrors && seriesErrors.length > 0 && (
        <div className="series-errors">
          <h3>Details:</h3>
          <ul>
            {seriesErrors.map((err, index) => (
              <li key={index}>{err}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ErrorMessage; 