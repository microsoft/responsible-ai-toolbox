// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IDataBalanceMeasures } from "./IDataBalanceMeasures";
import { IFeatureMetaData } from "./IMetaData";

export enum DatasetTaskType {
  Regression = "regression",
  Classification = "classification",
  ImageClassification = "image_classification",
  TextClassification = "text_classification",
  MultilabelTextClassification = "multilabel_text_classification",
  MultilabelImageClassification = "multilabel_image_classification",
  Forecasting = "forecasting",
  ObjectDetection = "object_detection"
}

export interface IDataset {
  task_type: DatasetTaskType;
  true_y: number[] | number[][];
  predicted_y?: number[] | number[][];
  probability_y?: number[][];
  features: unknown[][];
  feature_names: string[];
  categorical_features: string[];
  is_large_data_scenario?: boolean;
  use_entire_test_data?: boolean;
  class_names?: string[];
  target_column?: string | string[];
  data_balance_measures?: IDataBalanceMeasures;
  feature_metadata?: IFeatureMetaData;
  images?: string[];
  index?: string[];
  object_detection_true_y?: number[][][];
  object_detection_predicted_y?: number[][][];
}

// TODO Remove DatasetSummary when possible
export interface IDatasetSummary {
  featureNames?: string[];
  classNames?: string[];
  categoricalMap?: { [key: number]: string[] };
}
