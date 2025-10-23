import { createFileRoute } from '@tanstack/react-router';
import { Box, Container, Paper, Stack, Typography } from '@mui/material';
import { PageHeader } from '../../components/PageHeader';
import { useDetailQuery } from '../../hooks/useDetailQuery';
import { useCSVStatistics } from '../../hooks/useCSVStatistics';
import Plot from 'react-plotly.js';

export const Route = createFileRoute('/explore-data/$id')({
  component: DataDetailPage,
});

/**
 * Detail view for a selected row from the` <DataExplorer>` in the explore-data Task Flow.
 */
function DataDetailPage() {
  const { id } = Route.useParams();

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
  const { stats, data, loading, error } = useCSVStatistics(filename);

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
              },
              yaxis: {
                title: 'Price ($/kWh)',
              },
              showlegend: false,
            }}
            style={{ width: '100%', height: '400px' }}
            config={{ responsive: true }}
          />
        </Stack>
      </Paper>
    </Stack>
  );
}
