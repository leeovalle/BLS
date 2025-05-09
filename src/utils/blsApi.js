/**
 * BLS API utility functions
 */

// BLS API V2 base URL
const BLS_API_BASE_URL = 'https://api.bls.gov/publicAPI/v2/timeseries/data/';

// Default time range
const DEFAULT_START_YEAR = '2015';
const DEFAULT_END_YEAR = '2025';

/**
 * Fetch data from BLS API for a single series
 * 
 * @param {string} seriesId - BLS series ID
 * @param {string} apiKey - BLS API key
 * @param {string} startYear - Start year for data (default: 2015)
 * @param {string} endYear - End year for data (default: 2025)
 * @returns {Promise<Object>} - Data for the requested series
 * @throws {Error} - If the API request fails
 */
const fetchSeriesData = async (
  seriesId,
  apiKey,
  startYear = DEFAULT_START_YEAR,
  endYear = DEFAULT_END_YEAR
) => {
  if (!seriesId) {
    throw new Error('Series ID is required');
  }

  if (!apiKey) {
    throw new Error('API key is required');
  }

  const response = await fetch(
    `${BLS_API_BASE_URL}${seriesId}?registrationkey=${apiKey}&startyear=${startYear}&endyear=${endYear}`
  );

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const json = await response.json();

  if (json.status && json.status !== 'REQUEST_SUCCEEDED') {
    throw new Error(`API error: ${json.message || 'Request failed'}`);
  }

  if (!json.Results || !json.Results.series || json.Results.series.length === 0) {
    throw new Error(`No series data returned for ${seriesId}`);
  }

  return json.Results.series[0];
};

/**
 * Process raw BLS API data for a series
 * 
 * @param {Object} rawData - Raw data from BLS API
 * @param {Object} seriesInfo - Information about the series (name, category, etc.)
 * @returns {Array} - Processed data points
 */
const processSeriesData = (rawData, seriesInfo) => {
  if (!rawData || !rawData.data || rawData.data.length === 0) {
    return [];
  }

  return rawData.data.map(point => ({
    id: seriesInfo.id,
    name: seriesInfo.name,
    category: seriesInfo.category,
    subcategory: seriesInfo.subcategory,
    unit: seriesInfo.unit,
    year: point.year,
    period: point.period,
    periodName: point.periodName,
    value: point.value,
    footnotes: point.footnotes,
  }));
};

export {
  fetchSeriesData,
  processSeriesData,
  DEFAULT_START_YEAR,
  DEFAULT_END_YEAR
}; 