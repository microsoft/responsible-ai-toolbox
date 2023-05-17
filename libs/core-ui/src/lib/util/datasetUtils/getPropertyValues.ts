// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { DatasetCohortColumns } from "../../DatasetCohortColumns";
import { IDataset } from "../../Interfaces/IDataset";
import { ModelTypes } from "../../Interfaces/IExplanationContext";
import { IsBinary, IsMulticlass, IsMultilabel } from "../ExplanationUtils";
import { MulticlassClassificationEnum } from "../JointDatasetUtils";

// get property values for the selected data point
export function getPropertyValues(
  indexes: number[],
  property: string,
  dataset: IDataset,
  modelType?: ModelTypes
): unknown[] {
  if (property === DatasetCohortColumns.Index) {
    return indexes;
  }
  if (property === DatasetCohortColumns.PredictedY) {
    const predictedYs = dataset.predicted_y;
    if (predictedYs) {
      return indexes.map((index) => {
        return predictedYs[index];
      });
    }
  }
  const classNames = dataset.class_names;
  if (classNames && property.startsWith(DatasetCohortColumns.ProbabilityY)) {
    const probYs = dataset.probability_y;
    const i = Number(property.slice(DatasetCohortColumns.ProbabilityY.length));
    if (probYs && i < classNames.length) {
      return indexes.map((index) => {
        return probYs[index][i];
      });
    }
  }
  const featureIndex = dataset.feature_names.findIndex(
    (item) => item === property
  );
  if (featureIndex >= 0) {
    return indexes.map((index) => {
      return dataset.features[index][featureIndex];
    });
  }
  if (property === DatasetCohortColumns.TrueY) {
    return indexes.map((index) => {
      return dataset.true_y[index];
    });
  }
  if (dataset.predicted_y && dataset.true_y) {
    return getErrors(property, indexes, dataset, modelType);
  }
  return [];
}

function getErrors(
  property: string,
  indexes: number[],
  dataset: IDataset,
  modelType?: ModelTypes
): unknown[] {
  if (
    dataset.predicted_y &&
    !Array.isArray(dataset.true_y) &&
    !Array.isArray(dataset.predicted_y)
  ) {
    const trueY: number[] = [];
    const predictedY: number[] = [];
    for (let i = 0; i < dataset.features.length; i++) {
      trueY.push(dataset.true_y[i]);
      predictedY.push(dataset.predicted_y[i]);
    }
    if (
      modelType === ModelTypes.Regression &&
      property === DatasetCohortColumns.RegressionError
    ) {
      return indexes.map((index) => {
        return Math.abs(trueY[index] - predictedY[index]);
      });
    }
    if (
      property === DatasetCohortColumns.ClassificationError &&
      modelType &&
      IsBinary(modelType)
    ) {
      return indexes.map((index) => {
        return 2 * trueY[index] + predictedY[index];
      });
    }
    if (
      property === DatasetCohortColumns.ClassificationError &&
      modelType &&
      (IsMulticlass(modelType) || IsMultilabel(modelType))
    ) {
      return indexes.map((index) => {
        return trueY[index] !== predictedY[index]
          ? MulticlassClassificationEnum.Misclassified
          : MulticlassClassificationEnum.Correct;
      });
    }
  }
  return [];
}
