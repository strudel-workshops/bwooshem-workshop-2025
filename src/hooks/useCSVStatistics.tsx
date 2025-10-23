import { useEffect, useState } from 'react';
import { csv } from 'd3-fetch';
import { cleanPath } from '../utils/queryParams.utils';

interface CSVStatistics {
  count: number;
  average: number;
  median: number;
  max: number;
  min: number;
  averageDailyPriceDelta: number;
}

interface MonthlyStatistics {
  month: string;
  average: number;
  median: number;
  max: number;
  min: number;
  count: number;
  averageDailyPriceDelta: number;
}

interface HourlyProfile {
  hour: number;
  averagePrice: number;
  medianPrice: number;
}

interface MonthlyHourlyProfile {
  month: string;
  profile: HourlyProfile[];
  weekdayProfile: HourlyProfile[];
  weekendProfile: HourlyProfile[];
}

interface CSVDataPoint {
  datetime: string;
  price: number;
}

interface UseCSVStatisticsResult {
  stats: CSVStatistics | null;
  data: CSVDataPoint[];
  monthlyStats: MonthlyStatistics[];
  hourlyProfile: HourlyProfile[];
  weekdayHourlyProfile: HourlyProfile[];
  weekendHourlyProfile: HourlyProfile[];
  monthlyHourlyProfiles: MonthlyHourlyProfile[];
  loading: boolean;
  error: string | null;
}

/**
 * Custom hook to load a CSV file and calculate statistics for the "Price ($/kWh)" column
 */
export function useCSVStatistics(filename: string): UseCSVStatisticsResult {
  const [stats, setStats] = useState<CSVStatistics | null>(null);
  const [data, setData] = useState<CSVDataPoint[]>([]);
  const [monthlyStats, setMonthlyStats] = useState<MonthlyStatistics[]>([]);
  const [hourlyProfile, setHourlyProfile] = useState<HourlyProfile[]>([]);
  const [weekdayHourlyProfile, setWeekdayHourlyProfile] = useState<
    HourlyProfile[]
  >([]);
  const [weekendHourlyProfile, setWeekendHourlyProfile] = useState<
    HourlyProfile[]
  >([]);
  const [monthlyHourlyProfiles, setMonthlyHourlyProfiles] = useState<
    MonthlyHourlyProfile[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!filename) {
      setStats(null);
      setData([]);
      setMonthlyStats([]);
      setHourlyProfile([]);
      setWeekdayHourlyProfile([]);
      setWeekendHourlyProfile([]);
      setMonthlyHourlyProfiles([]);
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

        // Calculate average daily price delta
        const dailyData: { [date: string]: number[] } = {};
        dataPoints.forEach((point) => {
          const dateStr = point.datetime.split(' ')[0]; // Extract date only
          if (!dailyData[dateStr]) {
            dailyData[dateStr] = [];
          }
          dailyData[dateStr].push(point.price);
        });

        const dailyDeltas = Object.values(dailyData).map((dayPrices) => {
          const dayMax = Math.max(...dayPrices);
          const dayMin = Math.min(...dayPrices);
          return dayMax - dayMin;
        });

        const averageDailyPriceDelta =
          dailyDeltas.length > 0
            ? dailyDeltas.reduce((acc, val) => acc + val, 0) /
              dailyDeltas.length
            : 0;

        setStats({
          count,
          average: Math.round(average * 10000) / 10000, // Round to 4 decimal places
          median: Math.round(median * 10000) / 10000,
          max: Math.round(max * 10000) / 10000,
          min: Math.round(min * 10000) / 10000,
          averageDailyPriceDelta:
            Math.round(averageDailyPriceDelta * 10000) / 10000,
        });

        // Calculate monthly statistics
        const monthlyData: { [key: string]: number[] } = {};

        dataPoints.forEach((point) => {
          // Extract year-month from datetime string (format: "2024-12-01 00:00:00-08:00")
          const dateStr = point.datetime.split(' ')[0]; // "2024-12-01"
          const yearMonth = dateStr.substring(0, 7); // "2024-12"

          if (!monthlyData[yearMonth]) {
            monthlyData[yearMonth] = [];
          }
          monthlyData[yearMonth].push(point.price);
        });

        // Calculate statistics for each month
        const monthlyStatsArray: MonthlyStatistics[] = Object.keys(monthlyData)
          .sort()
          .map((yearMonth) => {
            const monthPrices = monthlyData[yearMonth];
            const monthCount = monthPrices.length;
            const monthSum = monthPrices.reduce((acc, val) => acc + val, 0);
            const monthAverage = monthSum / monthCount;
            const sortedMonthPrices = [...monthPrices].sort((a, b) => a - b);
            const monthMedian =
              monthCount % 2 === 0
                ? (sortedMonthPrices[monthCount / 2 - 1] +
                    sortedMonthPrices[monthCount / 2]) /
                  2
                : sortedMonthPrices[Math.floor(monthCount / 2)];
            const monthMax = Math.max(...monthPrices);
            const monthMin = Math.min(...monthPrices);

            // Calculate average daily price delta for this month
            const monthDailyData: { [date: string]: number[] } = {};
            dataPoints.forEach((point) => {
              const dateStr = point.datetime.split(' ')[0];
              const pointYearMonth = dateStr.substring(0, 7);
              if (pointYearMonth === yearMonth) {
                if (!monthDailyData[dateStr]) {
                  monthDailyData[dateStr] = [];
                }
                monthDailyData[dateStr].push(point.price);
              }
            });

            const monthDailyDeltas = Object.values(monthDailyData).map(
              (dayPrices) => {
                const dayMax = Math.max(...dayPrices);
                const dayMin = Math.min(...dayPrices);
                return dayMax - dayMin;
              }
            );

            const monthAverageDailyPriceDelta =
              monthDailyDeltas.length > 0
                ? monthDailyDeltas.reduce((acc, val) => acc + val, 0) /
                  monthDailyDeltas.length
                : 0;

            // Format month as "December 2024" for display
            const [year, month] = yearMonth.split('-');
            const monthNames = [
              'January',
              'February',
              'March',
              'April',
              'May',
              'June',
              'July',
              'August',
              'September',
              'October',
              'November',
              'December',
            ];
            const monthName = monthNames[parseInt(month, 10) - 1];

            return {
              month: `${monthName} ${year}`,
              average: Math.round(monthAverage * 10000) / 10000,
              median: Math.round(monthMedian * 10000) / 10000,
              max: Math.round(monthMax * 10000) / 10000,
              min: Math.round(monthMin * 10000) / 10000,
              count: monthCount,
              averageDailyPriceDelta:
                Math.round(monthAverageDailyPriceDelta * 10000) / 10000,
            };
          });

        setMonthlyStats(monthlyStatsArray);

        // Helper function to determine if a date is a weekday
        const isWeekday = (datetimeStr: string): boolean => {
          // Parse the full datetime string with timezone to get accurate day of week
          const date = new Date(datetimeStr);
          const dayOfWeek = date.getDay();
          return dayOfWeek >= 1 && dayOfWeek <= 5; // Monday (1) to Friday (5)
        };

        // Calculate hourly profile (average price for each hour of the day)
        const hourlyData: { [hour: number]: number[] } = {};
        const weekdayHourlyData: { [hour: number]: number[] } = {};
        const weekendHourlyData: { [hour: number]: number[] } = {};

        dataPoints.forEach((point) => {
          // Extract hour from datetime string (format: "2024-12-01 00:00:00-08:00")
          const timeStr = point.datetime.split(' ')[1]; // "00:00:00-08:00"
          const hour = parseInt(timeStr.split(':')[0], 10); // 0

          if (!hourlyData[hour]) {
            hourlyData[hour] = [];
          }
          hourlyData[hour].push(point.price);

          // Also categorize by weekday/weekend
          if (isWeekday(point.datetime)) {
            if (!weekdayHourlyData[hour]) {
              weekdayHourlyData[hour] = [];
            }
            weekdayHourlyData[hour].push(point.price);
          } else {
            if (!weekendHourlyData[hour]) {
              weekendHourlyData[hour] = [];
            }
            weekendHourlyData[hour].push(point.price);
          }
        });

        // Calculate average and median price for each hour
        const hourlyProfileArray: HourlyProfile[] = Array.from(
          { length: 24 },
          (_, hour) => {
            const hourPrices = hourlyData[hour] || [];
            const averagePrice =
              hourPrices.length > 0
                ? hourPrices.reduce((acc, val) => acc + val, 0) /
                  hourPrices.length
                : 0;

            let medianPrice = 0;
            if (hourPrices.length > 0) {
              const sortedHourPrices = [...hourPrices].sort((a, b) => a - b);
              medianPrice =
                hourPrices.length % 2 === 0
                  ? (sortedHourPrices[hourPrices.length / 2 - 1] +
                      sortedHourPrices[hourPrices.length / 2]) /
                    2
                  : sortedHourPrices[Math.floor(hourPrices.length / 2)];
            }

            return {
              hour,
              averagePrice: Math.round(averagePrice * 10000) / 10000,
              medianPrice: Math.round(medianPrice * 10000) / 10000,
            };
          }
        );

        setHourlyProfile(hourlyProfileArray);

        // Calculate weekday hourly profile
        const weekdayHourlyProfileArray: HourlyProfile[] = Array.from(
          { length: 24 },
          (_, hour) => {
            const hourPrices = weekdayHourlyData[hour] || [];
            const averagePrice =
              hourPrices.length > 0
                ? hourPrices.reduce((acc, val) => acc + val, 0) /
                  hourPrices.length
                : 0;

            let medianPrice = 0;
            if (hourPrices.length > 0) {
              const sortedHourPrices = [...hourPrices].sort((a, b) => a - b);
              medianPrice =
                hourPrices.length % 2 === 0
                  ? (sortedHourPrices[hourPrices.length / 2 - 1] +
                      sortedHourPrices[hourPrices.length / 2]) /
                    2
                  : sortedHourPrices[Math.floor(hourPrices.length / 2)];
            }

            return {
              hour,
              averagePrice: Math.round(averagePrice * 10000) / 10000,
              medianPrice: Math.round(medianPrice * 10000) / 10000,
            };
          }
        );

        setWeekdayHourlyProfile(weekdayHourlyProfileArray);

        // Calculate weekend hourly profile
        const weekendHourlyProfileArray: HourlyProfile[] = Array.from(
          { length: 24 },
          (_, hour) => {
            const hourPrices = weekendHourlyData[hour] || [];
            const averagePrice =
              hourPrices.length > 0
                ? hourPrices.reduce((acc, val) => acc + val, 0) /
                  hourPrices.length
                : 0;

            let medianPrice = 0;
            if (hourPrices.length > 0) {
              const sortedHourPrices = [...hourPrices].sort((a, b) => a - b);
              medianPrice =
                hourPrices.length % 2 === 0
                  ? (sortedHourPrices[hourPrices.length / 2 - 1] +
                      sortedHourPrices[hourPrices.length / 2]) /
                    2
                  : sortedHourPrices[Math.floor(hourPrices.length / 2)];
            }

            return {
              hour,
              averagePrice: Math.round(averagePrice * 10000) / 10000,
              medianPrice: Math.round(medianPrice * 10000) / 10000,
            };
          }
        );

        setWeekendHourlyProfile(weekendHourlyProfileArray);

        // Calculate hourly profiles for each month
        const monthlyHourlyProfilesArray: MonthlyHourlyProfile[] = Object.keys(
          monthlyData
        )
          .sort()
          .map((yearMonth) => {
            const monthDataPoints = dataPoints.filter((point) => {
              const dateStr = point.datetime.split(' ')[0];
              const pointYearMonth = dateStr.substring(0, 7);
              return pointYearMonth === yearMonth;
            });

            // Calculate hourly profile for this month
            const monthHourlyData: { [hour: number]: number[] } = {};
            const monthWeekdayHourlyData: { [hour: number]: number[] } = {};
            const monthWeekendHourlyData: { [hour: number]: number[] } = {};

            monthDataPoints.forEach((point) => {
              const timeStr = point.datetime.split(' ')[1];
              const hour = parseInt(timeStr.split(':')[0], 10);

              if (!monthHourlyData[hour]) {
                monthHourlyData[hour] = [];
              }
              monthHourlyData[hour].push(point.price);

              // Also categorize by weekday/weekend for this month
              if (isWeekday(point.datetime)) {
                if (!monthWeekdayHourlyData[hour]) {
                  monthWeekdayHourlyData[hour] = [];
                }
                monthWeekdayHourlyData[hour].push(point.price);
              } else {
                if (!monthWeekendHourlyData[hour]) {
                  monthWeekendHourlyData[hour] = [];
                }
                monthWeekendHourlyData[hour].push(point.price);
              }
            });

            const monthHourlyProfile: HourlyProfile[] = Array.from(
              { length: 24 },
              (_, hour) => {
                const hourPrices = monthHourlyData[hour] || [];
                const averagePrice =
                  hourPrices.length > 0
                    ? hourPrices.reduce((acc, val) => acc + val, 0) /
                      hourPrices.length
                    : 0;

                let medianPrice = 0;
                if (hourPrices.length > 0) {
                  const sortedHourPrices = [...hourPrices].sort(
                    (a, b) => a - b
                  );
                  medianPrice =
                    hourPrices.length % 2 === 0
                      ? (sortedHourPrices[hourPrices.length / 2 - 1] +
                          sortedHourPrices[hourPrices.length / 2]) /
                        2
                      : sortedHourPrices[Math.floor(hourPrices.length / 2)];
                }

                return {
                  hour,
                  averagePrice: Math.round(averagePrice * 10000) / 10000,
                  medianPrice: Math.round(medianPrice * 10000) / 10000,
                };
              }
            );

            // Calculate weekday profile for this month
            const monthWeekdayProfile: HourlyProfile[] = Array.from(
              { length: 24 },
              (_, hour) => {
                const hourPrices = monthWeekdayHourlyData[hour] || [];
                const averagePrice =
                  hourPrices.length > 0
                    ? hourPrices.reduce((acc, val) => acc + val, 0) /
                      hourPrices.length
                    : 0;

                let medianPrice = 0;
                if (hourPrices.length > 0) {
                  const sortedHourPrices = [...hourPrices].sort(
                    (a, b) => a - b
                  );
                  medianPrice =
                    hourPrices.length % 2 === 0
                      ? (sortedHourPrices[hourPrices.length / 2 - 1] +
                          sortedHourPrices[hourPrices.length / 2]) /
                        2
                      : sortedHourPrices[Math.floor(hourPrices.length / 2)];
                }

                return {
                  hour,
                  averagePrice: Math.round(averagePrice * 10000) / 10000,
                  medianPrice: Math.round(medianPrice * 10000) / 10000,
                };
              }
            );

            // Calculate weekend profile for this month
            const monthWeekendProfile: HourlyProfile[] = Array.from(
              { length: 24 },
              (_, hour) => {
                const hourPrices = monthWeekendHourlyData[hour] || [];
                const averagePrice =
                  hourPrices.length > 0
                    ? hourPrices.reduce((acc, val) => acc + val, 0) /
                      hourPrices.length
                    : 0;

                let medianPrice = 0;
                if (hourPrices.length > 0) {
                  const sortedHourPrices = [...hourPrices].sort(
                    (a, b) => a - b
                  );
                  medianPrice =
                    hourPrices.length % 2 === 0
                      ? (sortedHourPrices[hourPrices.length / 2 - 1] +
                          sortedHourPrices[hourPrices.length / 2]) /
                        2
                      : sortedHourPrices[Math.floor(hourPrices.length / 2)];
                }

                return {
                  hour,
                  averagePrice: Math.round(averagePrice * 10000) / 10000,
                  medianPrice: Math.round(medianPrice * 10000) / 10000,
                };
              }
            );

            // Format month as "December 2024" for display
            const [year, month] = yearMonth.split('-');
            const monthNames = [
              'January',
              'February',
              'March',
              'April',
              'May',
              'June',
              'July',
              'August',
              'September',
              'October',
              'November',
              'December',
            ];
            const monthName = monthNames[parseInt(month, 10) - 1];

            return {
              month: `${monthName} ${year}`,
              profile: monthHourlyProfile,
              weekdayProfile: monthWeekdayProfile,
              weekendProfile: monthWeekendProfile,
            };
          });

        setMonthlyHourlyProfiles(monthlyHourlyProfilesArray);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to load CSV data'
        );
        setStats(null);
        setData([]);
        setMonthlyStats([]);
        setHourlyProfile([]);
        setWeekdayHourlyProfile([]);
        setWeekendHourlyProfile([]);
        setMonthlyHourlyProfiles([]);
      } finally {
        setLoading(false);
      }
    };

    loadCSVData();
  }, [filename]);

  return {
    stats,
    data,
    monthlyStats,
    hourlyProfile,
    weekdayHourlyProfile,
    weekendHourlyProfile,
    monthlyHourlyProfiles,
    loading,
    error,
  };
}
