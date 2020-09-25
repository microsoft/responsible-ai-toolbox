// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export interface IInterpretData {
  errorMessage?: string;
  featureNames: string[];
  noDataset?: boolean;
  datasetBarLabel?: string[];
  noFeatureImportance?: boolean;
  noLocalImportance?: boolean;
}
