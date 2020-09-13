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
