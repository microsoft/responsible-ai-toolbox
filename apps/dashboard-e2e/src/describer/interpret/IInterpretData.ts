// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export interface IInterpretData {
  errorMessage?: string;
  featureNames: string[];
  noDataset?: boolean;
  noFeatureImportance?: boolean;
  noLocalImportance?: boolean;
}
