// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export enum FeatureKeys {
  AbsoluteGlobal = "absoluteGlobal",
  AbsoluteLocal = "absoluteLocal"
}

export type FeatureSortingKey = number | FeatureKeys;

export interface IBarChartConfig {
  topK: number;
  sortingKey?: FeatureSortingKey;
  defaultVisibleClasses?: number[];
}
