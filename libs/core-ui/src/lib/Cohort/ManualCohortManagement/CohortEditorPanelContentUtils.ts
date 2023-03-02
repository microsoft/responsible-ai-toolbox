// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IChoiceGroupOption } from "@fluentui/react";
import { localization } from "@responsible-ai/localization";
import { ICategoricalRange, INumericRange } from "@responsible-ai/mlchartlib";

import { DatasetCohort } from "../../DatasetCohort";
import { JointDataset } from "../../util/JointDataset";

export function getChoices2(datasetFeatureRanges?: {
  [key: string]: INumericRange | ICategoricalRange;
}): IChoiceGroupOption[] {
  const choices = [
    {
      key: DatasetCohort.Index,
      text: localization.Interpret.CohortEditor.choiceGroup.index
    },
    {
      key: DatasetCohort.Dataset,
      text: localization.Interpret.CohortEditor.choiceGroup.dataset
    },
    {
      key: DatasetCohort.PredictedY,
      text: localization.Interpret.CohortEditor.choiceGroup.predictedY
    },
    {
      key: DatasetCohort.TrueY,
      text: localization.Interpret.CohortEditor.choiceGroup.trueY
    }
  ];
  if (
    datasetFeatureRanges &&
    datasetFeatureRanges[DatasetCohort.ClassificationError]
  ) {
    choices.push({
      key: DatasetCohort.ClassificationError,
      text: localization.Interpret.CohortEditor.choiceGroup
        .classificationOutcome
    });
  }
  if (
    datasetFeatureRanges &&
    datasetFeatureRanges[DatasetCohort.RegressionError]
  ) {
    choices.push({
      key: DatasetCohort.RegressionError,
      text: localization.Interpret.CohortEditor.choiceGroup.regressionError
    });
  }
  return choices;
}

export function getChoices(jointDataset: JointDataset): IChoiceGroupOption[] {
  return [
    JointDataset.IndexLabel,
    JointDataset.DataLabelRoot,
    JointDataset.PredictedYLabel,
    JointDataset.TrueYLabel,
    JointDataset.ClassificationError,
    JointDataset.RegressionError
  ].reduce((previousValue: IChoiceGroupOption[], key: string) => {
    const metaVal = jointDataset.metaDict[key];
    if (key === JointDataset.DataLabelRoot && jointDataset.hasDataset) {
      previousValue.push({ key, text: "Dataset" });
      return previousValue;
    }
    if (metaVal === undefined) {
      return previousValue;
    }
    previousValue.push({ key, text: metaVal.abbridgedLabel });
    return previousValue;
  }, []);
}

export function getFilterLabel(column: string): string {
  const filters = getChoices2();
  let label = column;
  filters.forEach((filter) => {
    if (filter.key === column) {
      label = filter.text;
    }
  });
  return label;
}

export const filterArgRetainableList = [
  JointDataset.PredictedYLabel,
  JointDataset.TrueYLabel,
  JointDataset.ClassificationError
];

export const filterArgRetainableList2 = [
  DatasetCohort.PredictedY,
  DatasetCohort.TrueY,
  DatasetCohort.ClassificationError
];
