// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { localization } from "@responsible-ai/localization";
import {
  ICategoricalRange,
  INumericRange,
  RangeTypes
} from "@responsible-ai/mlchartlib";
import _ from "lodash";

import { DatasetCohortColumns } from "../../DatasetCohortColumns";
import { IDataset } from "../../Interfaces/IDataset";
import { ModelTypes } from "../../Interfaces/IExplanationContext";
import { IsBinary, IsMulticlass } from "../ExplanationUtils";

// TODO: the feature ranges should come from backend, it does not make sense to calculate at FE for big data
export function getFeatureRanges(
  dataset: IDataset,
  modelType: ModelTypes
): {
  [key: string]: INumericRange | ICategoricalRange;
} {
  const ranges = {};
  // get dataset features' range
  dataset.feature_names.forEach((feature) => {
    const range = getDatasetFeatureRange(dataset, feature);
    ranges[feature] = range;
  });
  const indexRange = getIndexFeatureRange(dataset);
  ranges[DatasetCohortColumns.Index] = indexRange;

  // get regression error and classification error ranges
  if (dataset.predicted_y && dataset.true_y) {
    const classificationErrorRange =
      getClassificationErrorFeatureRange(modelType);
    if (classificationErrorRange) {
      ranges[DatasetCohortColumns.ClassificationError] =
        classificationErrorRange;
    }
    const regressionErrorRange = getRegressionErrorFeatureRange(
      dataset,
      modelType
    );
    if (regressionErrorRange) {
      ranges[DatasetCohortColumns.RegressionError] = regressionErrorRange;
    }
    // get feature ranges for predicted Y
    getRange(
      dataset,
      modelType,
      dataset.predicted_y,
      DatasetCohortColumns.PredictedY,
      ranges
    );
    // get feature ranges for true Y
    getRange(
      dataset,
      modelType,
      dataset.true_y,
      DatasetCohortColumns.TrueY,
      ranges
    );
  }
  return ranges;
}

function getIndexFeatureRange(dataset: IDataset): INumericRange {
  return {
    max: dataset.features.length - 1,
    min: 0,
    rangeType: RangeTypes.Integer
  };
}

function getDatasetFeatureRange(
  dataset: IDataset,
  column: string
): INumericRange | ICategoricalRange {
  const featureIndex = dataset.feature_names.findIndex(
    (item) => item === column
  );
  const featureVector = dataset.features.map((row) => row[featureIndex]);
  const isCategorical = dataset.categorical_features.includes(column);
  return isCategorical
    ? ({
        rangeType: RangeTypes.Categorical,
        uniqueValues: _.uniq(featureVector).sort()
      } as ICategoricalRange)
    : ({
        max: _.max(featureVector) || 0,
        min: _.min(featureVector) || 0,
        rangeType: featureVector.every((val) => Number.isInteger(val))
          ? RangeTypes.Integer
          : RangeTypes.Numeric
      } as INumericRange);
}

function getClassificationErrorFeatureRange(
  modelType: ModelTypes
): ICategoricalRange | undefined {
  if (IsBinary(modelType)) {
    return {
      rangeType: RangeTypes.Categorical,
      uniqueValues: [
        localization.Interpret.Columns.trueNegative,
        localization.Interpret.Columns.falsePositive,
        localization.Interpret.Columns.falseNegative,
        localization.Interpret.Columns.truePositive
      ]
    };
  }
  if (IsMulticlass(modelType)) {
    return {
      rangeType: RangeTypes.Categorical,
      uniqueValues: [
        localization.Interpret.Columns.correctlyClassified,
        localization.Interpret.Columns.misclassified
      ]
    };
  }
  return;
}

function getRegressionErrorFeatureRange(
  dataset: IDataset,
  modelType: ModelTypes
): INumericRange | undefined {
  if (modelType === ModelTypes.Regression && dataset.predicted_y) {
    const regressionErrors = [];
    for (let index = 0; index < dataset.features.length; index++) {
      const trueY = dataset.true_y[index];
      const predictedY = dataset.predicted_y[index];
      if (Array.isArray(trueY) || Array.isArray(predictedY)) {
        return;
      }
      regressionErrors.push(Math.abs(trueY - predictedY));
    }
    return {
      max: _.max(regressionErrors) || 0,
      min: _.min(regressionErrors) || 0,
      rangeType: RangeTypes.Numeric
    };
  }
  return;
}

function getRange(
  dataset: IDataset,
  modelType: ModelTypes,
  values: number[] | number[][],
  property: string,
  ranges: { [key: string]: INumericRange | ICategoricalRange }
): void {
  let categoricalValues = dataset.class_names;
  // if it is 1D array
  if (!Array.isArray(values[0])) {
    if (modelType === ModelTypes.Regression) {
      const numbers: number[] = [];
      // this for loop is only to let it make sure values is a 1D array, so it can be used with _.max and _.min
      values.forEach((value) => {
        if (!Array.isArray(value)) {
          numbers.push(value);
        }
      });
      ranges[property] = {
        max: _.max(numbers) || 0,
        min: _.min(numbers) || 0,
        rangeType: numbers.every((val) => Number.isInteger(val))
          ? RangeTypes.Integer
          : RangeTypes.Numeric
      };
    } else {
      ranges[property] = {
        rangeType: RangeTypes.Categorical,
        uniqueValues: categoricalValues || []
      };
    }
  }
  // if it is 2D array
  else {
    const length = values[0].length;
    for (let i = 0; i < length; i++) {
      const subProperty = property + i.toString();
      if (modelType === ModelTypes.Regression) {
        const vector = values.map((row) => row[i]);
        ranges[subProperty] = {
          max: _.max(vector) || 0,
          min: _.min(vector) || 0,
          rangeType: vector.every((val) => Number.isInteger(val))
            ? RangeTypes.Integer
            : RangeTypes.Numeric
        };
      } else if (Array.isArray(dataset.target_column)) {
        categoricalValues = ["", dataset.target_column[i]];
        ranges[subProperty] = {
          rangeType: RangeTypes.Categorical,
          uniqueValues: categoricalValues
        };
      }
    }
  }
}
