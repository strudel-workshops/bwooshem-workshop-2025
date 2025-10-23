import { useEffect, useState } from 'react';

interface WeatherDataPoint {
  datetime: string;
  temperature: number;
}

interface UseWeatherDataResult {
  data: WeatherDataPoint[];
  loading: boolean;
  error: string | null;
}

interface CityCoordinates {
  [key: string]: {
    lat: number;
    lon: number;
  };
}

const CITY_COORDINATES: CityCoordinates = {
  'San Jose': { lat: 37.3382, lon: -121.8863 },
  Berkeley: { lat: 37.8715, lon: -122.273 },
  Sacramento: { lat: 38.5816, lon: -121.4944 },
};

/**
 * Custom hook to fetch historical weather data from Open-Meteo API
 * @param city - City name (San Jose, Berkeley, or Sacramento)
 * @param startDate - Start date in YYYY-MM-DD format
 * @param endDate - End date in YYYY-MM-DD format
 */
export function useWeatherData(
  city: string,
  startDate: string | null,
  endDate: string | null
): UseWeatherDataResult {
  const [data, setData] = useState<WeatherDataPoint[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!city || !startDate || !endDate) {
      setData([]);
      setLoading(false);
      setError(null);
      return;
    }

    const fetchWeatherData = async () => {
      setLoading(true);
      setError(null);

      try {
        const coordinates = CITY_COORDINATES[city];
        if (!coordinates) {
          throw new Error(`Unknown city: ${city}`);
        }

        // Open-Meteo API endpoint for historical weather data
        const url = `https://archive-api.open-meteo.com/v1/archive?latitude=${coordinates.lat}&longitude=${coordinates.lon}&start_date=${startDate}&end_date=${endDate}&hourly=temperature_2m&temperature_unit=fahrenheit&timezone=America/Los_Angeles`;

        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(
            `Failed to fetch weather data: ${response.statusText}`
          );
        }

        const result = await response.json();

        if (
          !result.hourly ||
          !result.hourly.time ||
          !result.hourly.temperature_2m
        ) {
          throw new Error('Invalid weather data format');
        }

        // Transform the data into the expected format
        const weatherData: WeatherDataPoint[] = result.hourly.time.map(
          (time: string, index: number) => ({
            datetime: time,
            temperature: result.hourly.temperature_2m[index],
          })
        );

        setData(weatherData);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to fetch weather data'
        );
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchWeatherData();
  }, [city, startDate, endDate]);

  return { data, loading, error };
}
