// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  DatasetTaskType,
  getModelTypeFromExplanation,
  getModelTypeFromTextExplanation,
  IDataset,
  IModelExplanationData,
  ModelTypes
} from "@responsible-ai/core-ui";

export function getModelType(
  dataset: IDataset,
  modelExplanationData?: Array<
    Omit<IModelExplanationData, "method" | "predictedY" | "probabilityY">
  >
): ModelTypes {
  let modelType: ModelTypes = ModelTypes.Multiclass;
  const classNames = dataset.class_names;
  if (dataset.task_type === DatasetTaskType.Regression) {
    modelType = ModelTypes.Regression;
  } else if (dataset.task_type === DatasetTaskType.Classification) {
    modelType = getModelTypeFromExplanation(
      modelExplanationData?.[0]?.precomputedExplanations,
      dataset.probability_y
    );
  }
  if (dataset.task_type === DatasetTaskType.ImageClassification) {
    if (classNames && classNames.length === 2) {
      modelType = ModelTypes.ImageBinary;
    } else {
      modelType = ModelTypes.ImageMulticlass;
    }
  } else if (dataset.task_type === DatasetTaskType.TextClassification) {
    if (classNames) {
      if (classNames.length === 2) {
        modelType = ModelTypes.TextBinary;
      } else {
        modelType = ModelTypes.TextMulticlass;
      }
    } else {
      getModelTypeFromTextExplanation(
        modelExplanationData?.[0]?.precomputedExplanations,
        dataset.probability_y
      );
    }
  } else if (
    dataset.task_type === DatasetTaskType.MultilabelImageClassification
  ) {
    modelType = ModelTypes.ImageMultilabel;
  } else if (
    dataset.task_type === DatasetTaskType.MultilabelTextClassification
  ) {
    modelType = ModelTypes.TextMultilabel;
  }
  return modelType;
}
