import React from 'react';
import { seriesData } from '../data/blsSeriesData';

/**
 * Component to display statistical calculations for data series
 */
const StatisticsPanel = ({ statistics }) => {
  if (!statistics || Object.keys(statistics).length === 0) {
    return (
      <div className="statistics-container empty-stats">
        <h2>Data Statistics</h2>
        <p className="no-stats-message">
          No statistics available for the current selection. Try adjusting your filters or search criteria.
        </p>
      </div>
    );
  }

  return (
    <div className="statistics-container">
      <h2>Data Statistics Summary</h2>
      <p className="stats-description">
        These statistics provide a summary view of the key economic indicators from the Bureau of Labor Statistics.
        For detailed records and historical data, click the "Show Detailed BLS Data" button below.
      </p>
      
      {Object.entries(statistics).map(([seriesId, stats]) => {
        const series = seriesData.find(s => s.id === seriesId);
        
        if (!series || !stats) {
          return null;
        }
        
        return (
          <div key={seriesId} className="statistics-section">
            <h3>{series.name}</h3>
            <div className="statistics">
              <div className="stat-card">
                <h4>Total Records</h4>
                <p className="stat-value">{stats.totalCount}</p>
                <p className="stat-desc">Matching current filters</p>
              </div>
              
              <div className="stat-card">
                <h4>Average</h4>
                <p className="stat-value">{stats.average} {series.unit}</p>
                <p className="stat-desc">Mean value</p>
              </div>
              
              <div className="stat-card">
                <h4>Median</h4>
                <p className="stat-value">{stats.median} {series.unit}</p>
                <p className="stat-desc">Middle value</p>
              </div>
              
              <div className="stat-card">
                <h4>Mode</h4>
                <p className="stat-value">{stats.mode} {series.unit}</p>
                <p className="stat-desc">Most frequent value</p>
              </div>
              
              <div className="stat-card">
                <h4>Range</h4>
                <p className="stat-value">
                  {stats.min} - {stats.max} {series.unit}
                </p>
                <p className="stat-desc">Min and max values</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default StatisticsPanel; 