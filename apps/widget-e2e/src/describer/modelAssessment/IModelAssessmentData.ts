// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export interface IModelAssessmentData {
  errorAnalysisData?: IErrorAnalysisData;
  IModelStatisticsData?: IModelStatisticsData;
  datasetExplorerData?: IDatasetExplorerData;
  featureImportanceData?: IFeatureImportanceData;
  causalAnalysisData?: ICausalAnalysisData;
  whatIfCounterfactualsData?: IWhatIfCounterfactualsData;
  featureNames?: string[];
}

export interface IErrorAnalysisData {
  errorMessage?: string;
  hoverNodeData?: { [key: string]: string };
  defaultMetric?: string;
  metricList?: string[];
  nodeValuesOnMetricChange?: { [key: string]: string };
  nodeHeader?: string;
  filterInfoOnBranch?: string[];
  basicInformationData?: { [key: string]: string[] };
  errorCoverage?: string;
  errorRate?: string;
  modelStatisticsData?: { [key: string]: string[] };
  dataExplorerData?: { [key: string]: string[] };
  featureImportanceData?: { [key: string]: string[] };
  whatIfCounterfactualsData?: { [key: string]: string[] };
  featureList?: string[];
  sliderName?: string[];
  cohortInfo?: { [key: string]: string[] };
}

export interface IModelStatisticsData {
  defaultYAxis?: string;
  defaultXAxis?: string;
  yAxisPanelOptions?: string[];
  newYAxisChartValues?: { [key: string]: string[] };
  xAxisPanelOptions?: string[];
  newXAxisChartValues?: { [key: string]: string[] };
  onUpdateSideBarValues?: { [key: string]: string[] };
  cohortDropDownValues?: string[];
}

export interface IDatasetExplorerData {
  whiskerPlot?: IDEWhiskerPlotData;
  dotPlot?: IDEDotPlotData;
}

export interface IDEWhiskerPlotData {
  featureList?: string[];
  defaultYAxis?: string;
  defaultXAxis?: string;
  yAxisPanelOptions?: string[];
  xAxisPanelOptions?: string[];
  dataPointsOnHover?: string[];
}

export interface IDEDotPlotData {
  defaultYAxis?: string;
  defaultXAxis?: string;
  yAxisPanelOptions?: string[];
  xAxisPanelOptions?: string[];
  dataPointsOnHover?: string[];
}

export interface IFeatureImportanceData {
  correctPredictionDatapoint?: string;
  incorrectPredictionDatapoint?: string;
  noLocalImportance?: boolean;
  noPredict?: boolean;
  noFeatureImportance?: boolean;
  dropdownRowName?: string;
  noDataset?: boolean;
  noY?: boolean;
  topFeaturesText?: string;
  topFeaturesCurrentValue?: string;
  datapoint?: number;
  aggregateFeatureImportanceExpectedValues?: {
    [key: string]: number;
  };
}

export interface ICausalAnalysisData {
  dataPointsOnHover?: string[];
  dataOnXAxis?: string[];
  defaultYAxis?: string;
  defaultXAxis?: string;
  xAxisPanelOptions?: { [key: string]: string[] };
  yAxisPanelOptions?: { [key: string]: string[] };
  treatmentPolicyData?: { [key: string]: string[] };
}

export interface IWhatIfCounterfactualsData {
  isClassification?: boolean;
  noPredict?: boolean;
  noY?: boolean;
}

export enum RAINotebookNames {
  "ClassificationModelAssessment" = "responsibleaitoolbox-classification-model-assessment.py",
  "RegressionDecisionMaking" = "responsibleaitoolbox-regression-decision-making.py",
  "RegressionModelAssessment" = "responsibleaitoolbox-regression-model-assessment.py"
}
