import {
  Box,
  Button,
  Container,
  Paper,
  Stack,
  Step,
  StepLabel,
  Stepper,
  Typography,
  CircularProgress,
} from '@mui/material';
import { createFileRoute } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { AppLink } from '../../../../../components/AppLink';
import { useRunComputation } from '../../../-context/ContextProvider';
import { setResultsTableData } from '../../../-context/actions';
import {
  calculateHourlyCosts,
  calculateSummaryStats,
} from '../../../-utils/calculations';

export const Route = createFileRoute(
  '/run-computation/_layout/$id/_layout/results'
)({
  component: ResultsPage,
});

/**
 * Results page to display after a computation completes in the run-computation Task Flow.
 * Performs the calculation and displays a summary with total cost.
 */
function ResultsPage() {
  const { state, dispatch } = useRunComputation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<any>(null);

  /**
   * Perform the calculation when the component mounts
   */
  useEffect(() => {
    const runCalculation = async () => {
      try {
        setLoading(true);

        // Get input parameters and selected dataset from context
        const { inputParameters, selectedDataset } = state;

        if (!inputParameters || !selectedDataset) {
          setError(
            'Missing input parameters or dataset selection. Please go back and complete the form.'
          );
          setLoading(false);
          return;
        }

        // Load the CSV data - try the public data directory path
        const csvPath = `/data/${selectedDataset}.csv`;

        const response = await fetch(csvPath);

        if (!response.ok) {
          throw new Error(
            `Failed to load CSV file: ${response.status} ${response.statusText}`
          );
        }

        const csvText = await response.text();

        // Parse CSV (format: datetime, Price ($/kWh), cld, mec, mgcc, fixed cost)
        const lines = csvText.split('\n').slice(1); // Skip header
        const priceData = lines
          .filter((line) => line.trim())
          .map((line) => {
            const columns = line.split(',');
            // First column is datetime, second column is Price ($/kWh)
            return {
              datetime: columns[0].trim(),
              price: parseFloat(columns[1].trim()),
            };
          });

        if (priceData.length === 0) {
          throw new Error('No data found in CSV file');
        }

        // Perform calculation
        const results = calculateHourlyCosts(
          priceData,
          inputParameters.hourlyLoadProfile
        );

        // Calculate summary statistics
        const stats = calculateSummaryStats(results);
        setSummary(stats);

        // Store results in context
        dispatch(setResultsTableData(results));

        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Calculation failed');
        setLoading(false);
      }
    };

    runCalculation();
  }, []);

  return (
    <Stack spacing={0} flex={1}>
      <Box
        sx={{
          backgroundColor: 'white',
          padding: 2,
          borderBottom: '1px solid',
          borderColor: 'neutral.main',
        }}
      >
        <Stepper activeStep={2} sx={{ maxWidth: 850 }}>
          <Step key="Data Inputs">
            <StepLabel>
              <AppLink
                to="/run-computation/$id/data-inputs"
                params={{ id: 'new' }}
                sx={{ color: 'inherit', textDecoration: 'none' }}
              >
                Data Inputs
              </AppLink>
            </StepLabel>
          </Step>
          <Step key="Optimization Settings">
            <StepLabel>
              <AppLink
                to="/run-computation/$id/settings"
                params={{ id: 'new' }}
                sx={{ color: 'inherit', textDecoration: 'none' }}
              >
                Optimization Settings
              </AppLink>
            </StepLabel>
          </Step>
          <Step key="Results">
            <StepLabel>
              <AppLink
                to="/run-computation/$id/results"
                params={{ id: 'new' }}
                sx={{ color: 'inherit', textDecoration: 'none' }}
              >
                Results
              </AppLink>
            </StepLabel>
          </Step>
        </Stepper>
      </Box>
      <Stack direction="row" spacing={0} flex={1}>
        <Stack
          component="ul"
          direction="column"
          spacing={0}
          sx={{
            backgroundColor: 'white',
            listStyle: 'none',
            margin: 0,
            padding: 4,
            width: 300,
          }}
        >
          <Typography
            component="li"
            fontWeight="bold"
            sx={{
              marginBottom: 2,
            }}
          >
            Categories
          </Typography>
          <Typography
            component="li"
            sx={{
              backgroundColor: '#D9EEFE',
              borderRight: '4px solid',
              borderColor: 'primary.main',
              padding: '1rem 2rem',
              marginLeft: '-2rem !important',
              marginRight: '-2rem !important',
            }}
          >
            Summary
          </Typography>
          <Typography
            component="li"
            sx={{
              padding: '1rem 2rem',
              marginLeft: '-2rem !important',
              marginRight: '-2rem !important',
            }}
          >
            System Costing
          </Typography>
          <Typography
            component="li"
            sx={{
              padding: '1rem 2rem',
              marginLeft: '-2rem !important',
              marginRight: '-2rem !important',
            }}
          >
            System Metrics
          </Typography>
        </Stack>
        <Box flex={1}>
          <Container
            maxWidth="md"
            sx={{
              mt: 4,
            }}
          >
            <Paper sx={{ padding: 4 }}>
              {loading && (
                <Stack alignItems="center" spacing={2}>
                  <CircularProgress />
                  <Typography>Calculating results...</Typography>
                </Stack>
              )}

              {error && (
                <Stack spacing={2}>
                  <Typography color="error" variant="h6">
                    Error
                  </Typography>
                  <Typography color="error">{error}</Typography>
                  <AppLink
                    to="/run-computation/$id/settings"
                    params={{ id: 'new' }}
                  >
                    <Button variant="contained">Back to Settings</Button>
                  </AppLink>
                </Stack>
              )}

              {!loading && !error && summary && (
                <Stack spacing={3}>
                  <Typography variant="h5" component="h2" fontWeight="bold">
                    Calculation Summary
                  </Typography>

                  <Stack spacing={2}>
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                    >
                      <Typography variant="h6">Total Cost:</Typography>
                      <Typography
                        variant="h4"
                        color="primary"
                        fontWeight="bold"
                      >
                        ${summary.totalCost}
                      </Typography>
                    </Stack>

                    <Stack direction="row" justifyContent="space-between">
                      <Typography fontWeight="bold">
                        Average Cost per Hour:
                      </Typography>
                      <Typography>${summary.averageCost}</Typography>
                    </Stack>

                    <Stack direction="row" justifyContent="space-between">
                      <Typography fontWeight="bold">Total Load:</Typography>
                      <Typography>{summary.totalLoad} kW</Typography>
                    </Stack>

                    <Stack direction="row" justifyContent="space-between">
                      <Typography fontWeight="bold">Average Load:</Typography>
                      <Typography>{summary.averageLoad} kW</Typography>
                    </Stack>

                    <Stack direction="row" justifyContent="space-between">
                      <Typography fontWeight="bold">Data Points:</Typography>
                      <Typography>{summary.dataPoints}</Typography>
                    </Stack>
                  </Stack>
                </Stack>
              )}
            </Paper>
          </Container>
        </Box>
      </Stack>
      <Box
        sx={{
          backgroundColor: 'white',
          borderTop: '1px solid',
          borderColor: 'neutral.main',
          bottom: 0,
          padding: 2,
          position: 'fixed',
          width: '100%',
        }}
      >
        <AppLink to="/run-computation/$id/settings" params={{ id: 'new' }}>
          <Button variant="contained">Back to Optimization Settings</Button>
        </AppLink>
      </Box>
    </Stack>
  );
}
