/**
 * Utility functions for run-computation calculations
 */

interface PriceDataPoint {
  datetime: string;
  price: number;
}

interface CalculationResult {
  datetime: string;
  price: number;
  hourOfDay: number;
  load: number;
  cost: number;
}

/**
 * Parse hourly load profile from comma-separated string to array of numbers
 */
export function parseHourlyLoadProfile(input: string): number[] {
  const values = input.split(',').map((v) => parseFloat(v.trim()));

  if (values.length !== 24) {
    throw new Error('Hourly load profile must contain exactly 24 values');
  }

  if (values.some((v) => isNaN(v))) {
    throw new Error('All hourly load profile values must be valid numbers');
  }

  return values;
}

/**
 * Extract hour of day (0-23) from datetime string
 */
export function extractHourOfDay(datetime: string): number {
  // Expected format: "YYYY-MM-DD HH:MM:SS" or similar
  const datePart = datetime.split(' ');
  if (datePart.length >= 2) {
    const timePart = datePart[1].split(':');
    const hour = parseInt(timePart[0], 10);
    return hour;
  }

  // Fallback: try to parse as Date
  const date = new Date(datetime);
  return date.getHours();
}

/**
 * Calculate cost for each hour in the dataset by applying the hourly load profile
 */
export function calculateHourlyCosts(
  priceData: PriceDataPoint[],
  hourlyLoadProfile: number[]
): CalculationResult[] {
  return priceData.map((dataPoint) => {
    const hourOfDay = extractHourOfDay(dataPoint.datetime);
    const load = hourlyLoadProfile[hourOfDay];
    const cost = dataPoint.price * load;

    return {
      datetime: dataPoint.datetime,
      price: dataPoint.price,
      hourOfDay,
      load,
      cost,
    };
  });
}

/**
 * Calculate summary statistics for the results
 */
export function calculateSummaryStats(results: CalculationResult[]) {
  const totalCost = results.reduce((sum, r) => sum + r.cost, 0);
  const totalLoad = results.reduce((sum, r) => sum + r.load, 0);
  const averageCost = totalCost / results.length;
  const averageLoad = totalLoad / results.length;

  return {
    totalCost: totalCost.toFixed(2),
    averageCost: averageCost.toFixed(4),
    totalLoad: totalLoad.toFixed(2),
    averageLoad: averageLoad.toFixed(2),
    dataPoints: results.length,
  };
}
