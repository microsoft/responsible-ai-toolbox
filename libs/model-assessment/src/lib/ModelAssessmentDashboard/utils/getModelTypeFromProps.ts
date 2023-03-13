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
  let modelType: ModelTypes = ModelTypes.Multiclass;
  const classNames = props.dataset.class_names;
  if (props.dataset.task_type === DatasetTaskType.Regression) {
    modelType = ModelTypes.Regression;
  } else if (props.dataset.task_type === DatasetTaskType.Classification) {
    modelType = getModelTypeFromExplanation(
      props.modelExplanationData?.[0]?.precomputedExplanations,
      props.dataset.probability_y
    );
  }
  if (props.dataset.task_type === DatasetTaskType.ImageClassification) {
    if (classNames && classNames.length === 2) {
      modelType = ModelTypes.ImageBinary;
    } else {
      modelType = ModelTypes.ImageMulticlass;
    }
  } else if (props.dataset.task_type === DatasetTaskType.TextClassification) {
    if (classNames) {
      if (classNames.length === 2) {
        modelType = ModelTypes.TextBinary;
      } else {
        modelType = ModelTypes.TextMulticlass;
      }
    } else {
      getModelTypeFromTextExplanation(
        props.modelExplanationData?.[0]?.precomputedExplanations,
        props.dataset.probability_y
      );
    }
  } else if (
    props.dataset.task_type === DatasetTaskType.MultilabelImageClassification
  ) {
    modelType = ModelTypes.ImageMultilabel;
  } else if (
    props.dataset.task_type === DatasetTaskType.MultilabelTextClassification
  ) {
    modelType = ModelTypes.TextMultilabel;
  }
  return modelType;
}
