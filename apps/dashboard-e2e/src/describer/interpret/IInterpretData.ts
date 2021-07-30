// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export interface IInterpretData {
  errorMessage?: string;
  featureNames: string[];
  datasetBarLabel?: string[];
  datapoint?: number;
  defaultXAxis?: string;
  defaultYAxis?: string;
  noDataset?: boolean;
  noFeatureImportance?: boolean;
  noLocalImportance?: boolean;
  noPredict?: boolean;
  noY?: boolean;
  isClassification?: boolean;
  isMulticlass?: boolean;
  aggregateFeatureImportanceExpectedValues?: {
    [key: string]: number;
  };
}
