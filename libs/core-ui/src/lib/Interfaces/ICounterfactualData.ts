// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export interface ICounterfactualData {
  // TODO: remove featureNames when sdk integration
  cfs_list: number[][][];
  feature_names: string[];
}
