// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { DatasetCohort } from "../../DatasetCohort";
import { IDataset } from "../../Interfaces/IDataset";
import { ModelTypes } from "../../Interfaces/IExplanationContext";
import { IsBinary, IsMulticlass } from "../ExplanationUtils";
import { MulticlassClassificationEnum } from "../JointDatasetUtils";

// get property values for the selected data point
export function getPropertyValues(
  indexes: number[],
  property: string,
  dataset: IDataset,
  modelType?: ModelTypes
): any[] {
  if (property === DatasetCohort.Index) {
    return indexes;
  }
  if (property === DatasetCohort.PredictedY) {
    const predictedYs = dataset.predicted_y;
    if (predictedYs) {
      return indexes.map((index) => {
        return predictedYs[index];
      });
    }
  }
  const classNames = dataset.class_names;
  if (classNames && property === DatasetCohort.ProbabilityY + classNames[0]) {
    const probYs = dataset.probability_y;
    if (probYs) {
      return indexes.map((index) => {
        return probYs[index][0];
      });
    }
  }
  if (classNames && property === DatasetCohort.ProbabilityY + classNames[1]) {
    const probYs = dataset.probability_y;
    if (probYs) {
      return indexes.map((index) => {
        return probYs[index][1];
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
  if (property === DatasetCohort.TrueY) {
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
      property === DatasetCohort.RegressionError
    ) {
      return indexes.map((index) => {
        return Math.abs(trueY[index] - predictedY[index]);
      });
    }
    if (
      property === DatasetCohort.ClassificationError &&
      modelType &&
      IsBinary(modelType)
    ) {
      return indexes.map((index) => {
        return 2 * trueY[index] + predictedY[index];
      });
    }
    if (
      property === DatasetCohort.ClassificationError &&
      modelType &&
      IsMulticlass(modelType)
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
