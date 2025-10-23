import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import {
  Box,
  Button,
  Container,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { PageHeader } from '../../components/PageHeader';
import { useDetailQuery } from '../../hooks/useDetailQuery';
import { useCSVStatistics } from '../../hooks/useCSVStatistics';
import { useWeatherData } from '../../hooks/useWeatherData';
import Plot from 'react-plotly.js';

export const Route = createFileRoute('/explore-data/$id')({
  component: DataDetailPage,
});

/**
 * Detail view for a selected row from the` <DataExplorer>` in the explore-data Task Flow.
 */
function DataDetailPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();

  // Define query for this page and fetch data item
  const { data } = useDetailQuery({
    // CUSTOMIZE: detail data source
    dataSource: 'dummy-data/file-entities.json',
    // CUSTOMIZE: detail data unique ID field
    dataIdField: 'name',
    paramId: id,
    // CUSTOMIZE: query mode, 'client' or 'server'
    queryMode: 'client',
    staticParams: null,
  });

  return (
    <Box>
      <PageHeader
        // CUSTOMIZE: page header field
        pageTitle={data ? `${data.name}.csv` : ''}
        // CUSTOMIZE: breadcrumb title text
        breadcrumbTitle="File Detail"
        actions={
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate({ to: '/explore-data' })}
          >
            Back to Files
          </Button>
        }
        sx={{
          marginBottom: 1,
          padding: 2,
        }}
      />
      <Container maxWidth="xl">
        <Stack>
          {/* CUSTOMIZE: detail page content */}
          <CSVStatistics filename={data ? data.name : ''} />
        </Stack>
      </Container>
    </Box>
  );
}

/**
 * Component to load and display statistics for a CSV file
 */
function CSVStatistics({ filename }: { filename: string }) {
  const {
    stats,
    data,
    monthlyStats,
    hourlyProfile,
    weekdayHourlyProfile,
    weekendHourlyProfile,
    monthlyHourlyProfiles,
    loading,
    error,
  } = useCSVStatistics(filename);
  const [hourlyMetric, setHourlyMetric] = useState<'average' | 'median'>(
    'average'
  );
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [selectedDayType, setSelectedDayType] = useState<
    'all' | 'weekday' | 'weekend'
  >('all');
  const [selectedCity, setSelectedCity] = useState<string>('San Jose');
  const [xAxisRange, setXAxisRange] = useState<[string, string] | null>(null);

  // Extract date range from CSV data
  const dateRange =
    data.length > 0
      ? {
          startDate: data[0].datetime.split(' ')[0],
          endDate: data[data.length - 1].datetime.split(' ')[0],
        }
      : null;

  // Handler for synchronized zoom/pan on time-series charts
  const handleRelayout = (event: any) => {
    if (event['xaxis.range[0]'] && event['xaxis.range[1]']) {
      const newRange: [string, string] = [
        event['xaxis.range[0]'],
        event['xaxis.range[1]'],
      ];
      // Only update if the range has actually changed to prevent unnecessary re-renders
      setXAxisRange((prevRange) => {
        if (
          !prevRange ||
          prevRange[0] !== newRange[0] ||
          prevRange[1] !== newRange[1]
        ) {
          return newRange;
        }
        return prevRange;
      });
    } else if (event['xaxis.autorange']) {
      setXAxisRange(null);
    }
  };

  // Fetch weather data for selected city
  const weatherData = useWeatherData(
    selectedCity,
    dateRange?.startDate || null,
    dateRange?.endDate || null
  );

  if (!filename) {
    return (
      <Paper sx={{ padding: 2 }}>
        <Typography>No file selected</Typography>
      </Paper>
    );
  }

  if (loading) {
    return (
      <Paper sx={{ padding: 2 }}>
        <Typography>Loading CSV data...</Typography>
      </Paper>
    );
  }

  if (error) {
    return (
      <Paper sx={{ padding: 2 }}>
        <Typography color="error">Error: {error}</Typography>
      </Paper>
    );
  }

  if (!stats) {
    return (
      <Paper sx={{ padding: 2 }}>
        <Typography>No statistics available</Typography>
      </Paper>
    );
  }

  return (
    <Stack spacing={3}>
      <Paper sx={{ padding: 2 }}>
        <Stack spacing={2}>
          <Typography variant="h6" fontWeight="bold">
            Data Summary for {filename}.csv
          </Typography>
          <Stack spacing={1}>
            <Stack direction="row" justifyContent="space-between">
              <Typography fontWeight="bold">Number of datapoints:</Typography>
              <Typography>{stats.count.toLocaleString()}</Typography>
            </Stack>
            <Stack direction="row" justifyContent="space-between">
              <Typography fontWeight="bold">Average Price ($/kWh):</Typography>
              <Typography>${stats.average}</Typography>
            </Stack>
            <Stack direction="row" justifyContent="space-between">
              <Typography fontWeight="bold">Median Price ($/kWh):</Typography>
              <Typography>${stats.median}</Typography>
            </Stack>
            <Stack direction="row" justifyContent="space-between">
              <Typography fontWeight="bold">Maximum Price ($/kWh):</Typography>
              <Typography>${stats.max}</Typography>
            </Stack>
            <Stack direction="row" justifyContent="space-between">
              <Typography fontWeight="bold">Minimum Price ($/kWh):</Typography>
              <Typography>${stats.min}</Typography>
            </Stack>
          </Stack>
        </Stack>
      </Paper>
      <Paper sx={{ padding: 2 }}>
        <Stack spacing={2}>
          <Typography variant="h6" fontWeight="bold">
            Monthly Statistics
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>
                    <strong>Month</strong>
                  </TableCell>
                  <TableCell align="right">
                    <strong>Average ($/kWh)</strong>
                  </TableCell>
                  <TableCell align="right">
                    <strong>Median ($/kWh)</strong>
                  </TableCell>
                  <TableCell align="right">
                    <strong>Max ($/kWh)</strong>
                  </TableCell>
                  <TableCell align="right">
                    <strong>Min ($/kWh)</strong>
                  </TableCell>
                  <TableCell align="right">
                    <strong>Data Points</strong>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {monthlyStats.map((monthStat) => (
                  <TableRow key={monthStat.month} hover>
                    <TableCell>{monthStat.month}</TableCell>
                    <TableCell align="right">${monthStat.average}</TableCell>
                    <TableCell align="right">${monthStat.median}</TableCell>
                    <TableCell align="right">${monthStat.max}</TableCell>
                    <TableCell align="right">${monthStat.min}</TableCell>
                    <TableCell align="right">
                      {monthStat.count.toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Stack>
      </Paper>
      <Paper sx={{ padding: 2 }}>
        <Stack spacing={2}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            flexWrap="wrap"
            gap={2}
          >
            <Typography variant="h6" fontWeight="bold">
              Typical Daily Profile
            </Typography>
            <Stack direction="row" spacing={2} flexWrap="wrap">
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel id="month-filter-label">Time Period</InputLabel>
                <Select
                  labelId="month-filter-label"
                  id="month-filter-select"
                  value={selectedMonth}
                  label="Time Period"
                  onChange={(e) => setSelectedMonth(e.target.value)}
                >
                  <MenuItem value="all">All Data</MenuItem>
                  {monthlyHourlyProfiles.map((monthProfile) => (
                    <MenuItem
                      key={monthProfile.month}
                      value={monthProfile.month}
                    >
                      {monthProfile.month}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel id="day-type-label">Day Type</InputLabel>
                <Select
                  labelId="day-type-label"
                  id="day-type-select"
                  value={selectedDayType}
                  label="Day Type"
                  onChange={(e) =>
                    setSelectedDayType(
                      e.target.value as 'all' | 'weekday' | 'weekend'
                    )
                  }
                >
                  <MenuItem value="all">All Days</MenuItem>
                  <MenuItem value="weekday">Weekday</MenuItem>
                  <MenuItem value="weekend">Weekend</MenuItem>
                </Select>
              </FormControl>
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel id="hourly-metric-label">Metric</InputLabel>
                <Select
                  labelId="hourly-metric-label"
                  id="hourly-metric-select"
                  value={hourlyMetric}
                  label="Metric"
                  onChange={(e) =>
                    setHourlyMetric(e.target.value as 'average' | 'median')
                  }
                >
                  <MenuItem value="average">Average</MenuItem>
                  <MenuItem value="median">Median</MenuItem>
                </Select>
              </FormControl>
            </Stack>
          </Stack>
          <Plot
            data={[
              {
                x: (() => {
                  if (selectedMonth === 'all') {
                    if (selectedDayType === 'weekday')
                      return weekdayHourlyProfile.map((h) => h.hour);
                    if (selectedDayType === 'weekend')
                      return weekendHourlyProfile.map((h) => h.hour);
                    return hourlyProfile.map((h) => h.hour);
                  } else {
                    const monthData = monthlyHourlyProfiles.find(
                      (mp) => mp.month === selectedMonth
                    );
                    if (!monthData) return hourlyProfile.map((h) => h.hour);
                    if (selectedDayType === 'weekday')
                      return monthData.weekdayProfile.map((h) => h.hour);
                    if (selectedDayType === 'weekend')
                      return monthData.weekendProfile.map((h) => h.hour);
                    return monthData.profile.map((h) => h.hour);
                  }
                })(),
                y: (() => {
                  if (selectedMonth === 'all') {
                    if (selectedDayType === 'weekday') {
                      return weekdayHourlyProfile.map((h) =>
                        hourlyMetric === 'average'
                          ? h.averagePrice
                          : h.medianPrice
                      );
                    }
                    if (selectedDayType === 'weekend') {
                      return weekendHourlyProfile.map((h) =>
                        hourlyMetric === 'average'
                          ? h.averagePrice
                          : h.medianPrice
                      );
                    }
                    return hourlyProfile.map((h) =>
                      hourlyMetric === 'average'
                        ? h.averagePrice
                        : h.medianPrice
                    );
                  } else {
                    const monthData = monthlyHourlyProfiles.find(
                      (mp) => mp.month === selectedMonth
                    );
                    if (!monthData) {
                      return hourlyProfile.map((h) =>
                        hourlyMetric === 'average'
                          ? h.averagePrice
                          : h.medianPrice
                      );
                    }
                    if (selectedDayType === 'weekday') {
                      return monthData.weekdayProfile.map((h) =>
                        hourlyMetric === 'average'
                          ? h.averagePrice
                          : h.medianPrice
                      );
                    }
                    if (selectedDayType === 'weekend') {
                      return monthData.weekendProfile.map((h) =>
                        hourlyMetric === 'average'
                          ? h.averagePrice
                          : h.medianPrice
                      );
                    }
                    return monthData.profile.map((h) =>
                      hourlyMetric === 'average'
                        ? h.averagePrice
                        : h.medianPrice
                    );
                  }
                })(),
                type: 'scatter',
                mode: 'lines+markers',
                name: `${hourlyMetric === 'average' ? 'Average' : 'Median'} Price`,
                line: { color: '#2e7d32', width: 2 },
                marker: { size: 6 },
              },
            ]}
            layout={{
              autosize: true,
              margin: { l: 60, r: 40, t: 20, b: 60 },
              xaxis: {
                title: 'Hour of Day',
                tickmode: 'linear',
                tick0: 0,
                dtick: 2,
                range: [-0.5, 23.5],
              },
              yaxis: {
                title: `${hourlyMetric === 'average' ? 'Average' : 'Median'} Price ($/kWh)`,
              },
              showlegend: false,
            }}
            style={{ width: '100%', height: '400px' }}
            config={{ responsive: true }}
          />
        </Stack>
      </Paper>
      <Paper sx={{ padding: 2 }}>
        <Stack spacing={2}>
          <Typography variant="h6" fontWeight="bold">
            Price Over Time
          </Typography>
          <Plot
            data={[
              {
                x: data.map((d) => d.datetime),
                y: data.map((d) => d.price),
                type: 'scatter',
                mode: 'lines',
                name: 'Price ($/kWh)',
                line: { color: '#1976d2' },
              },
            ]}
            layout={{
              autosize: true,
              margin: { l: 60, r: 40, t: 20, b: 80 },
              xaxis: {
                title: 'Date/Time',
                tickangle: -45,
                ...(xAxisRange && { range: xAxisRange, autorange: false }),
              },
              yaxis: {
                title: 'Price ($/kWh)',
              },
              showlegend: false,
            }}
            style={{ width: '100%', height: '400px' }}
            config={{ responsive: true }}
            onRelayout={handleRelayout}
          />
        </Stack>
      </Paper>
      <Paper sx={{ padding: 2 }}>
        <Stack spacing={2}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            flexWrap="wrap"
            gap={2}
          >
            <Typography variant="h6" fontWeight="bold">
              Outdoor Air Temperature
            </Typography>
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel id="city-select-label">City</InputLabel>
              <Select
                labelId="city-select-label"
                id="city-select"
                value={selectedCity}
                label="City"
                onChange={(e) => setSelectedCity(e.target.value)}
              >
                <MenuItem value="San Jose">San Jose, CA</MenuItem>
                <MenuItem value="Berkeley">Berkeley, CA</MenuItem>
                <MenuItem value="Sacramento">Sacramento, CA</MenuItem>
              </Select>
            </FormControl>
          </Stack>
          {weatherData.loading && (
            <Typography>Loading temperature data...</Typography>
          )}
          {weatherData.error && (
            <Typography color="error">
              Error loading temperature: {weatherData.error}
            </Typography>
          )}
          {!weatherData.loading &&
            !weatherData.error &&
            weatherData.data.length > 0 && (
              <Plot
                data={[
                  {
                    x: weatherData.data.map((d) => d.datetime),
                    y: weatherData.data.map((d) => d.temperature),
                    type: 'scatter',
                    mode: 'lines',
                    name: 'Temperature (°F)',
                    line: { color: '#d32f2f' },
                  },
                ]}
                layout={{
                  autosize: true,
                  margin: { l: 60, r: 40, t: 20, b: 80 },
                  xaxis: {
                    title: 'Date/Time',
                    tickangle: -45,
                    ...(xAxisRange && { range: xAxisRange, autorange: false }),
                  },
                  yaxis: {
                    title: 'Temperature (°F)',
                  },
                  showlegend: false,
                }}
                style={{ width: '100%', height: '400px' }}
                config={{ responsive: true }}
                onRelayout={handleRelayout}
              />
            )}
        </Stack>
      </Paper>
    </Stack>
  );
}
