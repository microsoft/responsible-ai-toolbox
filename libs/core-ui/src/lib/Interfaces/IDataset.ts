// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IDataBalanceMeasures } from "./IDataBalanceMeasures";
import { IFeatureMetaData } from "./IMetaData";

export interface IDataset {
  task_type: "classification" | "regression" | "text_classification";
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
}

// TODO Remove DatasetSummary when possible
export interface IDatasetSummary {
  featureNames?: string[];
  classNames?: string[];
  categoricalMap?: { [key: number]: string[] };
}

export const classificationTask = "classification";
export const regressionTask = "regression";
