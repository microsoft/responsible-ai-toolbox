// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export interface ILocalExplanations {
  method: string;
  precomputedExplanations: IPrecomputedExplanations;
}

interface IPrecomputedExplanations {
  globalFeatureImportance: IGlobalFeatureImportance;
  localFeatureImportance: ILocalFeatureImportance;
}

interface IGlobalFeatureImportance {
  feature_list: string[];
  scores: number[];
}

interface ILocalFeatureImportance {
  intercept: number[];
  scores: number[][] | number[];
}
