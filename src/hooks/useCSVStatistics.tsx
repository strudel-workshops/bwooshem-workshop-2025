import { useEffect, useState } from 'react';
import { csv } from 'd3-fetch';
import { cleanPath } from '../utils/queryParams.utils';

interface CSVStatistics {
  count: number;
  average: number;
  median: number;
  max: number;
  min: number;
}

interface CSVDataPoint {
  datetime: string;
  price: number;
}

interface UseCSVStatisticsResult {
  stats: CSVStatistics | null;
  data: CSVDataPoint[];
  loading: boolean;
  error: string | null;
}

/**
 * Custom hook to load a CSV file and calculate statistics for the "Price ($/kWh)" column
 */
export function useCSVStatistics(filename: string): UseCSVStatisticsResult {
  const [stats, setStats] = useState<CSVStatistics | null>(null);
  const [data, setData] = useState<CSVDataPoint[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!filename) {
      setStats(null);
      setData([]);
      setLoading(false);
      setError(null);
      return;
    }

    const loadCSVData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Get the base portion of the URL. Will be blank when running locally.
        const base = document.querySelector('base')?.getAttribute('href') ?? '';
        // Use the VITE_BASE_URL env variable to specify a path prefix
        const basePath = import.meta.env.VITE_BASE_URL || '';
        const leadingSlash = basePath ? '/' : '';
        const basename = cleanPath(leadingSlash + base + basePath);

        // Load the CSV file from public/data directory
        const dataPath = `${basename}/data/${filename}.csv`;
        const csvData = await csv(dataPath);

        if (!csvData || csvData.length === 0) {
          throw new Error('No data found in CSV file');
        }

        // Extract column names
        const datetimeColumn = Object.keys(csvData[0])[0]; // First column (datetime)
        const priceColumn = Object.keys(csvData[0])[1]; // Second column "Price ($/kWh)"

        // Extract price values and data points for plotting
        const prices: number[] = [];
        const dataPoints: CSVDataPoint[] = [];

        csvData.forEach((row) => {
          const price = parseFloat(row[priceColumn]);
          if (!isNaN(price)) {
            prices.push(price);
            dataPoints.push({
              datetime: row[datetimeColumn],
              price: price,
            });
          }
        });

        if (prices.length === 0) {
          throw new Error('No valid price data found');
        }

        setData(dataPoints);

        // Calculate statistics
        const count = prices.length;
        const sum = prices.reduce((acc, val) => acc + val, 0);
        const average = sum / count;
        const sortedPrices = [...prices].sort((a, b) => a - b);
        const median =
          count % 2 === 0
            ? (sortedPrices[count / 2 - 1] + sortedPrices[count / 2]) / 2
            : sortedPrices[Math.floor(count / 2)];
        const max = Math.max(...prices);
        const min = Math.min(...prices);

        setStats({
          count,
          average: Math.round(average * 10000) / 10000, // Round to 4 decimal places
          median: Math.round(median * 10000) / 10000,
          max: Math.round(max * 10000) / 10000,
          min: Math.round(min * 10000) / 10000,
        });
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to load CSV data'
        );
        setStats(null);
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    loadCSVData();
  }, [filename]);

  return { stats, data, loading, error };
}
