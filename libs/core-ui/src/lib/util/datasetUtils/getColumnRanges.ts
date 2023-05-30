// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { localization } from "@responsible-ai/localization";
import { IColumnRange, RangeTypes } from "@responsible-ai/mlchartlib";
import _ from "lodash";

import { DatasetCohortColumns } from "../../DatasetCohortColumns";
import { IDataset } from "../../Interfaces/IDataset";
import { ModelTypes } from "../../Interfaces/IExplanationContext";
import { ifEnableLargeData } from "../buildInitialContext";
import { IsBinary, IsMulticlass } from "../ExplanationUtils";

// TODO: these ranges should come from backend, it does not make sense to calculate at FE for big data
export function getColumnRanges(
  dataset: IDataset,
  modelType: ModelTypes
): {
  [key: string]: IColumnRange;
} {
  const ranges = {};
  // get dataset features' range
  dataset.feature_names.forEach((feature) => {
    const range = ifEnableLargeData(dataset)
      ? getDatasetFeatureRangeForLargeData(dataset, feature)
      : getDatasetFeatureRange(dataset, feature);
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

function getIndexFeatureRange(dataset: IDataset): IColumnRange {
  return !ifEnableLargeData(dataset)
    ? {
        max: dataset.features.length - 1,
        min: 0,
        rangeType: RangeTypes.Integer,
        sortedUniqueValues: [...new Array(dataset.features.length).keys()]
      }
    : ({
        max: dataset.tabular_dataset_metadata?.num_rows
          ? dataset.tabular_dataset_metadata?.num_rows - 1
          : 0,
        min: 0,
        rangeType: RangeTypes.Integer
      } as IColumnRange);
}

function getDatasetFeatureRange(
  dataset: IDataset,
  column: string
): IColumnRange {
  const featureIndex = dataset.feature_names.findIndex(
    (item) => item === column
  );
  const featureVector = dataset.features.map((row) => row[featureIndex]);
  const isCategorical = dataset.categorical_features.includes(column);
  return isCategorical
    ? {
        rangeType: RangeTypes.Categorical,
        sortedUniqueValues: _.uniq(featureVector).sort()
      }
    : ({
        max: _.max(featureVector) || 0,
        min: _.min(featureVector) || 0,
        rangeType: featureVector.every((val) => Number.isInteger(val))
          ? RangeTypes.Integer
          : RangeTypes.Numeric,
        sortedUniqueValues: (_.uniq(featureVector) as number[]).sort((a, b) => {
          return a - b;
        })
      } as IColumnRange);
}

function getDatasetFeatureRangeForLargeData(
  dataset: IDataset,
  column: string
): IColumnRange {
  const featureRange = dataset.tabular_dataset_metadata?.feature_ranges.find(
    (obj) => {
      return obj.column_name === column;
    }
  );
  const rangeType = featureRange?.range_type;
  return rangeType === "categorical"
    ? {
        rangeType: RangeTypes.Categorical,
        sortedUniqueValues: featureRange?.unique_values.sort()
      }
    : ({
        max: featureRange?.max_value || 0,
        min: featureRange?.min_value || 0,
        rangeType: Number.isInteger(featureRange?.max_value)
          ? RangeTypes.Integer
          : RangeTypes.Numeric
      } as IColumnRange);
}

function getClassificationErrorFeatureRange(
  modelType: ModelTypes
): IColumnRange | undefined {
  if (IsBinary(modelType)) {
    return {
      rangeType: RangeTypes.Categorical,
      sortedUniqueValues: [
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
      sortedUniqueValues: [
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
): IColumnRange | undefined {
  if (modelType === ModelTypes.Regression && dataset.predicted_y) {
    const regressionErrors = [];
    for (let index = 0; index < dataset.features.length; index++) {
      const trueY = dataset.true_y[index];
      const predictedY = dataset.predicted_y[index];
      if (Array.isArray(trueY) || Array.isArray(predictedY)) {
        return;
      }
      if (typeof trueY !== "string" && typeof predictedY !== "string") {
        regressionErrors.push(Math.abs(trueY - predictedY));
      } else {
        regressionErrors.push(0);
      }
    }
    return {
      max: _.max(regressionErrors) || 0,
      min: _.min(regressionErrors) || 0,
      rangeType: RangeTypes.Numeric,
      sortedUniqueValues: _.uniq(regressionErrors).sort((a, b) => {
        return a - b;
      })
    };
  }
  return;
}

function getRange(
  dataset: IDataset,
  modelType: ModelTypes,
  values: number[] | number[][] | string[],
  property: string,
  ranges: { [key: string]: IColumnRange }
): void {
  let categoricalValues = dataset.class_names;
  // if it is 1D array
  if (!Array.isArray(values[0])) {
    if (modelType === ModelTypes.Regression) {
      const numbers: number[] = [];
      // this for loop is only to let it make sure values is a 1D array, so it can be used with _.max and _.min
      values.forEach((value) => {
        if (!Array.isArray(value)) {
          if (typeof value !== "string") {
            numbers.push(value);
          } else {
            numbers.push(0);
          }
        }
      });
      ranges[property] = {
        max: _.max(numbers) || 0,
        min: _.min(numbers) || 0,
        rangeType: numbers.every((val) => Number.isInteger(val))
          ? RangeTypes.Integer
          : RangeTypes.Numeric,
        sortedUniqueValues: _.uniq(numbers).sort((a, b) => {
          return a - b;
        })
      };
    } else {
      ranges[property] = {
        rangeType: RangeTypes.Categorical,
        sortedUniqueValues: categoricalValues || []
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
            : RangeTypes.Numeric,
          sortedUniqueValues: _.uniq(vector).sort((a, b) => {
            return a - b;
          })
        };
      } else if (Array.isArray(dataset.target_column)) {
        categoricalValues = ["", dataset.target_column[i]];
        ranges[subProperty] = {
          rangeType: RangeTypes.Categorical,
          sortedUniqueValues: categoricalValues
        };
      }
    }
  }
}
