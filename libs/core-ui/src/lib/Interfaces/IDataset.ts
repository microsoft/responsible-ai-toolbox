// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IDataBalanceMeasures } from "./IDataBalanceMeasures";
import { IFeatureMetaData } from "./IMetaData";

export enum DatasetTaskType {
  Regression = "regression",
  Classification = "classification",
  ImageClassification = "image_classification",
  TextClassification = "text_classification"
}

export interface IDataset {
  task_type: DatasetTaskType;
  true_y: number[];
  predicted_y?: number[];
  probability_y?: number[][];
  features: unknown[][];
  feature_names: string[];
  categorical_features: string[];
  class_names?: string[];
  target_column?: string;
  data_balance_measures?: IDataBalanceMeasures;
  feature_metadata?: IFeatureMetaData;
  images?: string[];
}

// TODO Remove DatasetSummary when possible
export interface IDatasetSummary {
  featureNames?: string[];
  classNames?: string[];
  categoricalMap?: { [key: number]: string[] };
}
