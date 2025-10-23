import {
  Box,
  Button,
  Container,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Step,
  StepLabel,
  Stepper,
  TextField,
  Typography,
} from '@mui/material';
import { useState } from 'react';
import { AppLink } from '../../../../../components/AppLink';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useDataFromSource } from '../../../../../hooks/useDataFromSource';
import { useRunComputation } from '../../../-context/ContextProvider';
import { setSelectedDataset } from '../../../-context/actions';

export const Route = createFileRoute(
  '/run-computation/_layout/$id/_layout/settings'
)({
  component: SettingsPage,
});

/**
 * Page to configure settings for a computational run.
 * Completing and submitting the form takes users to the
 * `<RunningComputation>` component.
 */
function SettingsPage() {
  const { dispatch } = useRunComputation();
  const navigate = useNavigate();
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [selectedDatasetLocal, setSelectedDatasetLocal] = useState('');

  // Load available CSV files from file-entities.json
  const fileEntities = useDataFromSource('dummy-data/file-entities.json');
  const csvFiles = Array.isArray(fileEntities)
    ? fileEntities.filter((file: any) => file.name)
    : [];

  const handleAdvancedToggle = () => {
    setShowAdvanced(!showAdvanced);
  };

  const handleRunScenario = async () => {
    try {
      // Save selected dataset to context
      dispatch(setSelectedDataset(selectedDatasetLocal));

      // Navigate directly to results page (calculation will happen there)
      navigate({ to: '/run-computation/$id/results', params: { id: 'new' } });
    } catch (err) {
      // Error handling could be added here
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
        <Stepper activeStep={1} sx={{ maxWidth: 850 }}>
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
      <Container
        maxWidth="md"
        sx={{
          mt: 4,
        }}
      >
        <Paper sx={{ padding: 3 }}>
          <Stack>
            <Typography variant="h6" component="h2">
              {/* CUSTOMIZE: settings page title */}
              Optimization Settings
            </Typography>
            <Grid container rowSpacing={2} alignItems="center">
              <Grid item md={3}>
                <Typography>Solver</Typography>
              </Grid>
              <Grid item md={9}>
                <FormControl fullWidth>
                  <Select id="solver-select" value="default" disabled>
                    <MenuItem value="default">Default</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item md={3}>
                <Typography>Price Dataset</Typography>
              </Grid>
              <Grid item md={9}>
                <FormControl fullWidth>
                  <InputLabel id="dataset-select-label">
                    Select Price Dataset
                  </InputLabel>
                  <Select
                    labelId="dataset-select-label"
                    id="dataset-select"
                    value={selectedDatasetLocal}
                    onChange={(e) => setSelectedDatasetLocal(e.target.value)}
                    label="Select Price Dataset"
                  >
                    {csvFiles.map((file: any) => (
                      <MenuItem key={file.name} value={file.name}>
                        {file.name}.csv
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item md={3}>
                <Typography>Time Constraints</Typography>
              </Grid>
              <Grid item md={9}>
                <TextField
                  id="time-constraints-field"
                  variant="outlined"
                  fullWidth
                />
              </Grid>
            </Grid>
            <Box>
              <Button onClick={handleAdvancedToggle}>
                {showAdvanced ? 'Hide' : 'Show'} advanced settings
              </Button>
            </Box>
            {showAdvanced && (
              <Grid container rowSpacing={2} alignItems="center">
                <Grid item md={3}>
                  <Typography>Another Setting</Typography>
                </Grid>
                <Grid item md={9}>
                  <FormControl fullWidth>
                    <Select id="another-select">
                      <MenuItem value={10}>Another Setting 1</MenuItem>
                      <MenuItem value={20}>Another Setting 2</MenuItem>
                      <MenuItem value={30}>Another Setting 3</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item md={3}>
                  <Typography>Another Setting</Typography>
                </Grid>
                <Grid item md={9}>
                  <FormControl fullWidth>
                    <Select id="another-2-select">
                      <MenuItem value={10}>Another Setting 1</MenuItem>
                      <MenuItem value={20}>Another Setting 2</MenuItem>
                      <MenuItem value={30}>Another Setting 3</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            )}
            <Box textAlign="right">
              <Button
                variant="contained"
                data-testid="rnc-run-button"
                sx={{ marginTop: 4 }}
                onClick={handleRunScenario}
                disabled={!selectedDatasetLocal}
              >
                Run Scenario
              </Button>
            </Box>
          </Stack>
        </Paper>
      </Container>
    </Stack>
  );
}
