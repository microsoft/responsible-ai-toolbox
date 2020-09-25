// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export interface IInterpretData {
  errorMessage?: string;
  featureNames: string[];
  noFeatureImportance?: boolean;
  noLocalImportance?: boolean;
  noDatasetExplorer?: boolean;
}
