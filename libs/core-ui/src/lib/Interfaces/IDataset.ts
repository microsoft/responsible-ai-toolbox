// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export interface IDataset {
  trueY: number[];
  features: any[][];
  featureNames?: string[];
  sensitiveFeatures?: any[][];
  sensitiveFeatureNames?: string[];
  classNames?: string[];
  categoricalMap?: { [key: number]: string[] };
}

// TODO Remove DatasetSummary when possible
export interface IDatasetSummary {
  featureNames?: string[];
  classNames?: string[];
  categoricalMap?: { [key: number]: string[] };
}
