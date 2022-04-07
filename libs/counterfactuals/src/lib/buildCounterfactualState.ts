// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  Cohort,
  WeightVectors,
  JointDataset,
  ModelTypes,
  IDataset
} from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";

import { ICounterfactualsTabState } from "./CounterfactualsTab";

export function buildCounterfactualState(
  dataset: IDataset,
  jointDataset: JointDataset,
  modelType: ModelTypes
): ICounterfactualsTabState {
  const cohorts = [
    new Cohort(localization.Interpret.Cohort.defaultLabel, jointDataset, [])
  ];
  const selectedWeightVector =
    modelType === ModelTypes.Multiclass ? WeightVectors.AbsAvg : 0;
  const weightVectorLabels = {
    [WeightVectors.AbsAvg]: localization.Interpret.absoluteAverage
  };
  const weightVectorOptions = [];
  if (modelType === ModelTypes.Multiclass) {
    weightVectorOptions.push(WeightVectors.AbsAvg);
  }
  const classNames = dataset.class_names;
  if (classNames) {
    classNames.forEach((name, index) => {
      weightVectorLabels[index] = localization.formatString(
        localization.Interpret.WhatIfTab.classLabel,
        name
      );
      weightVectorOptions.push(index);
    });
  }

  return {
    cohorts,
    selectedWeightVector,
    weightVectorLabels,
    weightVectorOptions
  };
}
