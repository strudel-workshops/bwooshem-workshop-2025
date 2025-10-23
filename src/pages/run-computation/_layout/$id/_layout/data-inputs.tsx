import {
  Box,
  Button,
  Container,
  Grid,
  Paper,
  Stack,
  Step,
  StepLabel,
  Stepper,
  TextField,
  Typography,
} from '@mui/material';
import { useState } from 'react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { AppLink } from '../../../../../components/AppLink';
import { useRunComputation } from '../../../-context/ContextProvider';
import { setInputParameters } from '../../../-context/actions';
import { parseHourlyLoadProfile } from '../../../-utils/calculations';

export const Route = createFileRoute(
  '/run-computation/_layout/$id/_layout/data-inputs'
)({
  component: DataInputsPage,
});

/**
 * Page to display input data after creating or selecting an item from
 * the `<ComputationsList>` page in the run-computation Task Flow.
 */
function DataInputsPage() {
  const { dispatch } = useRunComputation();
  const navigate = useNavigate();

  // Default hourly load profile: 100 kW for all 24 hours
  const defaultLoadProfile = Array(24).fill(100).join(', ');

  const [hourlyLoadProfile, setHourlyLoadProfile] =
    useState(defaultLoadProfile);
  const [shiftPercentage, setShiftPercentage] = useState('0');
  const [shedHours, setShedHours] = useState('2');
  const [loadUpHours, setLoadUpHours] = useState('4');
  const [error, setError] = useState<string | null>(null);

  const handleContinue = () => {
    try {
      // Parse and validate hourly load profile
      const loadProfile = parseHourlyLoadProfile(hourlyLoadProfile);

      // Save input parameters to context
      dispatch(
        setInputParameters({
          hourlyLoadProfile: loadProfile,
          shiftPercentage: parseFloat(shiftPercentage),
          shedHours: parseInt(shedHours, 10),
          loadUpHours: parseInt(loadUpHours, 10),
        })
      );

      // Navigate to settings page
      navigate({ to: '/run-computation/$id/settings', params: { id: 'new' } });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid input');
    }
  };

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
        <Stepper activeStep={0} sx={{ maxWidth: 850 }}>
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
      <Box flex={1} sx={{ overflow: 'auto' }}>
        <Container
          maxWidth="md"
          sx={{
            mt: 4,
            mb: 10,
          }}
        >
          <Paper sx={{ padding: 3 }}>
            <Stack spacing={3}>
              <Typography variant="h6" component="h2">
                Load Profile Parameters
              </Typography>
              {error && <Typography color="error">{error}</Typography>}
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    label="Hourly Load Profile (kW)"
                    helperText="Enter 24 comma-separated values representing hourly load for each hour of the day"
                    value={hourlyLoadProfile}
                    onChange={(e) => setHourlyLoadProfile(e.target.value)}
                    fullWidth
                    multiline
                    rows={3}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    label="Shift Percentage"
                    helperText="Value between 0-100"
                    type="number"
                    value={shiftPercentage}
                    onChange={(e) => setShiftPercentage(e.target.value)}
                    fullWidth
                    inputProps={{ min: 0, max: 100, step: 1 }}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    label="Shed Hours"
                    helperText="Integer value"
                    type="number"
                    value={shedHours}
                    onChange={(e) => setShedHours(e.target.value)}
                    fullWidth
                    inputProps={{ min: 0, step: 1 }}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    label="Load Up Hours"
                    helperText="Integer value"
                    type="number"
                    value={loadUpHours}
                    onChange={(e) => setLoadUpHours(e.target.value)}
                    fullWidth
                    inputProps={{ min: 0, step: 1 }}
                  />
                </Grid>
              </Grid>
            </Stack>
          </Paper>
        </Container>
      </Box>
      <Box
        sx={{
          backgroundColor: 'white',
          borderTop: '1px solid',
          borderColor: 'neutral.main',
          bottom: 0,
          padding: 2,
          position: 'fixed',
          textAlign: 'right',
          width: '100%',
        }}
      >
        <Button
          variant="contained"
          data-testid="rnc-settings-next-button"
          onClick={handleContinue}
        >
          Continue to Optimization Settings
        </Button>
      </Box>
    </Stack>
  );
}
