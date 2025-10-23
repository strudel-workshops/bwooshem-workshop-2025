import { RunComputationState } from './ContextProvider';

export enum RunComputationActionType {
  SET_LIST_TABLE_DATA = 'SET_LIST_TABLE_DATA',
  SET_INPUTS_TABLE_DATA = 'SET_INPUTS_TABLE_DATA',
  SET_RESULTS_TABLE_DATA = 'SET_RESULTS_TABLE_DATA',
  SET_RESULTS_LINECHART_DATA = 'SET_RESULTS_LINECHART_DATA',
  SET_RESULTS_BARCHART_DATA = 'SET_RESULTS_BARCHART_DATA',
  SET_INPUT_PARAMETERS = 'SET_INPUT_PARAMETERS',
  SET_SELECTED_DATASET = 'SET_SELECTED_DATASET',
}

export interface RunComputationAction {
  type: RunComputationActionType;
  payload?: any;
}

export const setListTableData = (
  data: RunComputationState['list']['table']['data']
): RunComputationAction => ({
  type: RunComputationActionType.SET_LIST_TABLE_DATA,
  payload: data,
});

export const setInputsTableData = (
  data: RunComputationState['inputs']['table']['data']
): RunComputationAction => ({
  type: RunComputationActionType.SET_INPUTS_TABLE_DATA,
  payload: data,
});

export const setResultsTableData = (
  data: RunComputationState['results']['table']['data']
): RunComputationAction => ({
  type: RunComputationActionType.SET_RESULTS_TABLE_DATA,
  payload: data,
});

export const setResultsLineChartData = (
  data: RunComputationState['results']['lineChart']['data']
): RunComputationAction => ({
  type: RunComputationActionType.SET_RESULTS_LINECHART_DATA,
  payload: data,
});

export const setResultsBarChartData = (
  data: RunComputationState['results']['barChart']['data']
): RunComputationAction => ({
  type: RunComputationActionType.SET_RESULTS_BARCHART_DATA,
  payload: data,
});

export const setInputParameters = (data: {
  hourlyLoadProfile: number[];
  shiftPercentage: number;
  shedHours: number;
  loadUpHours: number;
}): RunComputationAction => ({
  type: RunComputationActionType.SET_INPUT_PARAMETERS,
  payload: data,
});

export const setSelectedDataset = (data: string): RunComputationAction => ({
  type: RunComputationActionType.SET_SELECTED_DATASET,
  payload: data,
});
