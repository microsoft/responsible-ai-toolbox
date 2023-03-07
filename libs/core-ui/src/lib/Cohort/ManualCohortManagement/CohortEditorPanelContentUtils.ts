// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IChoiceGroupOption } from "@fluentui/react";
import { localization } from "@responsible-ai/localization";
import { ICategoricalRange, INumericRange } from "@responsible-ai/mlchartlib";

import { DatasetCohortColumns } from "../../DatasetCohortColumns";
import { JointDataset } from "../../util/JointDataset";

export function getChoices2(datasetFeatureRanges?: {
  [key: string]: INumericRange | ICategoricalRange;
}): IChoiceGroupOption[] {
  const choices = [
    {
      key: DatasetCohortColumns.Index,
      text: localization.Interpret.CohortEditor.choiceGroup.index
    },
    {
      key: DatasetCohortColumns.Dataset,
      text: localization.Interpret.CohortEditor.choiceGroup.dataset
    },
    {
      key: DatasetCohortColumns.PredictedY,
      text: localization.Interpret.CohortEditor.choiceGroup.predictedY
    },
    {
      key: DatasetCohortColumns.TrueY,
      text: localization.Interpret.CohortEditor.choiceGroup.trueY
    }
  ];
  if (
    datasetFeatureRanges &&
    datasetFeatureRanges[DatasetCohortColumns.ClassificationError]
  ) {
    choices.push({
      key: DatasetCohortColumns.ClassificationError,
      text: localization.Interpret.CohortEditor.choiceGroup
        .classificationOutcome
    });
  }
  if (
    datasetFeatureRanges &&
    datasetFeatureRanges[DatasetCohortColumns.RegressionError]
  ) {
    choices.push({
      key: DatasetCohortColumns.RegressionError,
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
  DatasetCohortColumns.PredictedY,
  DatasetCohortColumns.TrueY,
  DatasetCohortColumns.ClassificationError
];
