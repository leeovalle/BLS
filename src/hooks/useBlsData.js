import { useState, useEffect } from 'react';
import { seriesData, stateData, BLS_API_BASE_URL, BLS_DATA_START_YEAR, BLS_DATA_END_YEAR } from '../data/blsSeriesData';

/**
 * Custom hook for fetching and processing BLS data
 * @param {string} apiKey - The BLS API key
 * @param {string} activeTab - Current active tab (all, national, states)
 * @param {number} visibleStates - Number of states to display
 * @param {Object} filters - Current filter settings
 * @returns {Object} BLS data, loading state, and error information
 */
function useBlsData(apiKey, activeTab, visibleStates, filters = { subcategory: 'Florida' }) {
  const [blsData, setBlsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [seriesErrors, setSeriesErrors] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        setSeriesErrors([]);

        if (!apiKey) {
          throw new Error('BLS API key is not set. Please define VITE_BLS_API_KEY in your .env file.');
        }

        const allData = [];
        const errors = [];

        // Filter the series to fetch based on the current selection
        let seriesToFetch = [];

        if (activeTab === 'national') {
          // Only fetch national data - ensure we include both National and Inflation categories
          seriesToFetch = seriesData.filter(series => 
            series.category === 'National' || series.category === 'Inflation'
          );
          console.log('National tab selected, fetching:', seriesToFetch.map(s => s.name));
        } else if (activeTab === 'states') {
          // For 'states' tab - handle state data differently
          // Get the selected state name
          const selectedState = filters.subcategory || 'Florida';
          console.log(`Fetching data for state: ${selectedState}`);
          
          // Get all state series that match the selected state
          const stateSeries = stateData.filter(series => 
            series.name.startsWith(selectedState)
          );
          
          if (stateSeries.length === 0) {
            console.warn(`No series found for state: ${selectedState}`);
          } else {
            console.log(`Found ${stateSeries.length} series for ${selectedState}`);
          }
          
          seriesToFetch = stateSeries;
          
          console.log(`Fetching ${seriesToFetch.length} series for ${selectedState}`);
        } else {
          // For 'all' tab - only fetch essential data for the default view
          // Focus on the key national indicators and Florida
          const nationalData = seriesData.filter(series => 
            // National unemployment and employment
            (series.category === 'National' && 
              (series.name.includes('National Unemployment Rate') || 
               series.name.includes('Total Nonfarm Employment'))) ||
            // CPI and PPI inflation metrics
            (series.category === 'Inflation' && 
              (series.name.includes('Consumer Price Index') || 
               series.name.includes('Producer Price Index')))
          );
          
          console.log('All tab selected, fetching national indicators:', nationalData.map(s => s.name));
          
          // Only fetch Florida data for the default view
          const floridaData = stateData.filter(series => 
            series.name.includes('Florida')
          );
          
          seriesToFetch = [...nationalData, ...floridaData];
        }

        // Show a message about the API requests
        console.log(`Fetching ${seriesToFetch.length} series from BLS API...`);

        for (const series of seriesToFetch) {
          try {
            console.log(`Fetching data for series: ${series.id}`);
            const response = await fetch(
              `${BLS_API_BASE_URL}${series.id}?registrationkey=${apiKey}&startyear=${BLS_DATA_START_YEAR}&endyear=${BLS_DATA_END_YEAR}`
            );

            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }

            const json = await response.json();

            if (json.status && json.status !== 'REQUEST_SUCCEEDED') {
              throw new Error(`API error: ${json.message || 'Request failed'}`);
            }

            if (!json.Results || !json.Results.series || json.Results.series.length === 0) {
              throw new Error(`No series data returned for ${series.id}`);
            }

            const seriesData = json.Results.series[0].data;
            if (!seriesData || seriesData.length === 0) {
              throw new Error(`No data points found for ${series.id}`);
            }

            const processedData = seriesData.map((point) => ({
              id: series.id,
              name: series.name,
              category: series.category,
              subcategory: series.subcategory,
              unit: series.unit,
              year: point.year,
              period: point.period,
              periodName: point.periodName,
              value: point.value,
              footnotes: point.footnotes,
            }));

            allData.push(...processedData);
          } catch (err) {
            console.error(`Error fetching ${series.id}:`, err);
            errors.push(`Failed to fetch ${series.name}: ${err.message}`);
          }
        }

        if (allData.length === 0 && errors.length > 0) {
          throw new Error('No data fetched successfully. See details below.');
        }

        // Sort data by year and period for consistent display
        allData.sort((a, b) => {
          if (a.year !== b.year) return b.year - a.year;
          return b.period.localeCompare(a.period);
        });

        setBlsData(allData);
        setSeriesErrors(errors);
      } catch (err) {
        setError(`Failed to fetch BLS data: ${err.message}`);
        console.error('Error fetching BLS data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [apiKey, activeTab, visibleStates, filters]);

  return { blsData, loading, error, seriesErrors };
}

export default useBlsData; 