import React from 'react';
import {
  Box,
  Button,
  IconButton,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { LabelValueTable } from '../../../components/LabelValueTable';
import { AppLink } from '../../../components/AppLink';
import { useCSVStatistics } from '../../../hooks/useCSVStatistics';
import Plot from 'react-plotly.js';

interface PreviewPanelProps {
  /**
   * Data for the selected row from the main table
   */
  previewItem: any;
  /**
   * Function to handle hiding
   */
  onClose: () => void;
}

/**
 * Panel to show extra information about a row in a separate panel
 * next to the `<DataTablePanel>`.
 */
export const PreviewPanel: React.FC<PreviewPanelProps> = ({
  previewItem,
  onClose,
}) => {
  const { stats, data, loading, error } = useCSVStatistics(previewItem.name);

  return (
    <Paper
      elevation={0}
      sx={{
        height: '100%',
        padding: 2,
      }}
    >
      <Stack spacing={3}>
        <Stack spacing={1}>
          <Stack direction="row">
            <Typography variant="h6" component="h3" flex={1}>
              <AppLink to="/explore-data/$id" params={{ id: previewItem.name }}>
                {previewItem.name}.csv
              </AppLink>
            </Typography>
            <IconButton size="small" onClick={onClose}>
              <CloseIcon />
            </IconButton>
          </Stack>
          <Typography variant="body2">
            CSV file statistics for Price ($/kWh) column
          </Typography>
        </Stack>
        {loading && (
          <Box>
            <Typography>Loading statistics...</Typography>
          </Box>
        )}
        {error && (
          <Box>
            <Typography color="error">Error: {error}</Typography>
          </Box>
        )}
        {stats && (
          <>
            <Box>
              <Typography fontWeight="medium" mb={1}>
                Price Statistics
              </Typography>
              <LabelValueTable
                rows={[
                  {
                    label: 'Number of datapoints',
                    value: stats.count.toLocaleString(),
                  },
                  {
                    label: 'Average Price ($/kWh)',
                    value: `$${stats.average}`,
                  },
                  { label: 'Median Price ($/kWh)', value: `$${stats.median}` },
                  { label: 'Maximum Price ($/kWh)', value: `$${stats.max}` },
                  { label: 'Minimum Price ($/kWh)', value: `$${stats.min}` },
                ]}
              />
            </Box>
            <Box>
              <Typography fontWeight="medium" mb={1}>
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
                  margin: { l: 50, r: 20, t: 20, b: 50 },
                  xaxis: {
                    title: 'Date/Time',
                    tickangle: -45,
                  },
                  yaxis: {
                    title: 'Price ($/kWh)',
                  },
                  showlegend: false,
                }}
                style={{ width: '100%', height: '300px' }}
                config={{ responsive: true }}
              />
            </Box>
          </>
        )}
        <Stack direction="row">
          <AppLink to="/explore-data/$id" params={{ id: previewItem.name }}>
            <Button variant="contained">View details</Button>
          </AppLink>
        </Stack>
      </Stack>
    </Paper>
  );
};
