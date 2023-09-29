// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { INumericRange } from "@responsible-ai/mlchartlib";

import {
  IMultiClassLocalFeatureImportance,
  ISingleClassLocalFeatureImportance
} from "../Interfaces/ExplanationInterfaces";
import { IObjectDetectionLabelType } from "../Interfaces/IDataset";
import { IExplanationModelMetadata } from "../Interfaces/IExplanationContext";
import { IFeatureMetaData } from "../Interfaces/IMetaData";

import { AxisTypes } from "./IGenericChartProps";

export const NoLabel = "(none)";

export interface IJointDatasetArgs {
  dataset?: any[][];
  predictedY?: number[] | number[][] | string[];
  predictedProbabilities?: number[][];
  trueY?: number[] | number[][] | string[];
  localExplanations?:
    | IMultiClassLocalFeatureImportance
    | ISingleClassLocalFeatureImportance;
  metadata: IExplanationModelMetadata;
  featureMetaData?: IFeatureMetaData;
  targetColumn?: string | string[];
  objectDetectionLabels?: IObjectDetectionLabelType[];
}

export enum ColumnCategories {
  Outcome = "outcome",
  Dataset = "dataset",
  Index = "index",
  Explanation = "explanation",
  Cohort = "cohort",
  None = "none"
}

export enum ClassificationEnum {
  TrueNegative = 0,
  FalsePositive = 1,
  FalseNegative = 2,
  TruePositive = 3
}

export enum MulticlassClassificationEnum {
  Correct = 0,
  Misclassified = 1
}

// The object that will store user-facing strings and associated metadata
// It stores the categorical labels for any numeric bins
export interface IJointMeta {
  label: string;
  abbridgedLabel: string;
  AxisType?: AxisTypes;
  isCategorical: boolean;
  // used to allow user to treat integers as categorical (but switch back as convenient...)
  treatAsCategorical?: boolean;
  sortedCategoricalValues?: string[];
  featureRange?: INumericRange;
  category: ColumnCategories;
  index?: number;
}

export interface IDatasetMeta {
  featureMetaData?: IFeatureMetaData;
}
