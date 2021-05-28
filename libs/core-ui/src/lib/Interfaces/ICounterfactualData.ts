// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export interface ICounterfactualData {
  // TODO: remove featureNames when sdk integration
  cfsList: number[][][];
  featureNames: string[];
}
