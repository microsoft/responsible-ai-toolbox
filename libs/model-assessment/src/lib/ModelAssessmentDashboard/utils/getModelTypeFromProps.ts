// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  DatasetTaskType,
  getModelTypeFromExplanation,
  getModelTypeFromTextExplanation,
  ModelTypes
} from "@responsible-ai/core-ui";

import { IModelAssessmentDashboardProps } from "../ModelAssessmentDashboardProps";

export function getModelTypeFromProps(
  props: IModelAssessmentDashboardProps
): ModelTypes {
  const modelType: ModelTypes = ModelTypes.Multiclass;
  const classNames = props.dataset.class_names;
  const taskType = props.dataset.task_type;
  if (taskType === DatasetTaskType.Regression) {
    return ModelTypes.Regression;
  }
  if (taskType === DatasetTaskType.Classification) {
    return getModelTypeFromExplanation(
      props.modelExplanationData?.[0]?.precomputedExplanations,
      props.dataset.probability_y
    );
  }
  if (taskType === DatasetTaskType.ImageClassification) {
    return classNames && classNames.length === 2
      ? ModelTypes.ImageBinary
      : ModelTypes.ImageMulticlass;
  }
  if (taskType === DatasetTaskType.TextClassification) {
    if (classNames) {
      return classNames.length === 2
        ? ModelTypes.TextBinary
        : ModelTypes.TextMulticlass;
    }
    return getModelTypeFromTextExplanation(
      props.modelExplanationData?.[0]?.precomputedExplanations,
      props.dataset.probability_y
    );
  }
  if (taskType === DatasetTaskType.MultilabelImageClassification) {
    return ModelTypes.ImageMultilabel;
  }
  if (taskType === DatasetTaskType.MultilabelTextClassification) {
    return ModelTypes.TextMultilabel;
  }
  if (taskType === DatasetTaskType.ObjectDetection) {
    return ModelTypes.ObjectDetection;
  }
  if (taskType === DatasetTaskType.QuestionAnswering) {
    return ModelTypes.QuestionAnswering;
  }
  if (taskType === DatasetTaskType.GenerativeText) {
    return ModelTypes.GenerativeText;
  }
  return modelType;
}
