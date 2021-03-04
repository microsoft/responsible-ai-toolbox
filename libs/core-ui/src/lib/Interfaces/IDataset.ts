// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export interface IDataset {
  trueY: number[];
  features: any[][];
  featureNames: string[];
  categoricalMap?: { [key: number]: string[] };
  sensitiveFeatures?: any[][];
  sensitiveFeatureNames?: string[];
  sensitiveFeatureCategoricalMap?: { [key: number]: string[] };
  classNames?: string[];
}

// TODO Remove DatasetSummary when possible
export interface IDatasetSummary {
  featureNames?: string[];
  classNames?: string[];
  categoricalMap?: { [key: number]: string[] };
}

export function getDatasetSummary(dataset: IDataset, isFairness: boolean): IDatasetSummary{
  return {
    categoricalMap: isFairness ? dataset.sensitiveFeatureCategoricalMap : dataset.categoricalMap,
    classNames: dataset.classNames,
    featureNames: isFairness ? dataset.sensitiveFeatureNames : dataset.featureNames
  }
}