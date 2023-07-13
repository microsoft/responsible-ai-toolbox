// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export interface IModelAssessmentData {
  errorAnalysisData?: IErrorAnalysisData;
  modelOverviewData?: IModelOverviewData;
  featureImportanceData?: IFeatureImportanceData;
  featureNames?: string[];
  cohortDefaultName?: string;
  checkDupCohort?: boolean;
  isObjectDetection?: boolean;
  isMultiLabel?: boolean;
  isMulticlass?: boolean;
  isBinary?: boolean;
}

export interface IErrorAnalysisData {
  hasErrorAnalysisComponent?: boolean;
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

export interface IModelOverviewData {
  hasModelOverviewComponent?: boolean;
  initialCohorts?: IExpectedCohortData[];
  newCohort?: IExpectedCohortData;
  featureCohortView?: {
    singleFeatureCohorts: number;
    multiFeatureCohorts: number;
    firstFeatureToSelect: string;
    secondFeatureToSelect: string;
  };
}

interface IExpectedCohortData {
  name: string;
  sampleSize: string;
  metrics: { [name: string]: string };
}

export interface IFeatureImportanceData {
  hasFeatureImportanceComponent?: boolean;
  hasCorrectIncorrectDatapoints?: boolean;
  rowToSelect?: string;
  noLocalImportance?: boolean;
  noPredict?: boolean;
  noFeatureImportance?: boolean;
  dropdownRowName?: string;
  noDataset?: boolean;
  noY?: boolean;
  topFeaturesText?: string;
  topFeaturesCurrentValue?: string;
  datapoint?: number;
  newFeatureDropdownValue?: string;
  aggregateFeatureImportanceExpectedValues?: {
    [key: string]: number;
  };
  avgOfAbsValue?: string;
}

export enum RAIVisionNotebookNames {
  "FridgeMultilabelModelDebugging" = "responsibleaidashboard-fridge-multilabel-image-classification-model-debugging",
  "FridgeObjectDetectionModelDebugging" = "responsibleaidashboard-fridge-object-detection-model-debugging.ipynb"
}
