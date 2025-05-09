/**
 * Statistics utility functions for calculating data summaries
 */

import { seriesData } from '../data/blsSeriesData';

/**
 * Calculate statistics for a single series of data
 * @param {Array} dataPoints - Array of data points for a single series
 * @returns {Object} - Statistics including average, median, mode, min, max, and total count
 */
export function calculateSeriesStatistics(dataPoints) {
  // Return null if no data points
  if (!dataPoints || dataPoints.length === 0) {
    return null;
  }

  // Extract values and convert to numbers
  const values = dataPoints.map(item => parseFloat(item.value));
  const validValues = values.filter(v => !isNaN(v));

  // Return null if no valid values
  if (validValues.length === 0) {
    return null;
  }

  // Total count
  const totalCount = validValues.length;

  // Calculate average
  const sum = validValues.reduce((acc, val) => acc + val, 0);
  const average = (sum / totalCount).toFixed(2);

  // Calculate median
  const sortedValues = [...validValues].sort((a, b) => a - b);
  const middle = Math.floor(sortedValues.length / 2);
  const median = sortedValues.length % 2 === 0
    ? ((sortedValues[middle - 1] + sortedValues[middle]) / 2).toFixed(2)
    : sortedValues[middle].toFixed(2);

  // Calculate mode (most frequent value)
  const frequencyMap = {};
  let maxFrequency = 0;
  
  validValues.forEach(val => {
    const valStr = val.toFixed(2); // Convert to string to handle floating point precision
    frequencyMap[valStr] = (frequencyMap[valStr] || 0) + 1;
    if (frequencyMap[valStr] > maxFrequency) {
      maxFrequency = frequencyMap[valStr];
    }
  });
  
  const modes = Object.keys(frequencyMap)
    .filter(val => frequencyMap[val] === maxFrequency)
    .map(val => parseFloat(val));
    
  const mode = modes.length > 0 ? Math.min(...modes).toFixed(2) : 'N/A';

  // Calculate min and max
  const min = Math.min(...validValues).toFixed(2);
  const max = Math.max(...validValues).toFixed(2);

  return {
    totalCount,
    average,
    median,
    mode,
    min,
    max
  };
}

/**
 * Calculate statistics for multiple series based on filtered data
 * @param {Array} filteredData - Filtered BLS data points
 * @returns {Object} - Object containing statistics for each series ID
 */
export function calculateMultiSeriesStatistics(filteredData) {
  // Return null if no data
  if (filteredData.length === 0) {
    return null;
  }

  // Get unique series IDs in the filtered data
  const seriesIds = [...new Set(filteredData.map(item => item.id))];
  
  // Initialize results object
  const statsBySeries = {};

  // Calculate statistics for each series
  seriesIds.forEach(seriesId => {
    // Get data points for this series
    const seriesPoints = filteredData.filter(item => item.id === seriesId);
    
    // Calculate statistics for this series
    const stats = calculateSeriesStatistics(seriesPoints);
    
    // Add to results if we have valid stats
    if (stats) {
      statsBySeries[seriesId] = stats;
    }
  });

  return Object.keys(statsBySeries).length > 0 ? statsBySeries : null;
} 