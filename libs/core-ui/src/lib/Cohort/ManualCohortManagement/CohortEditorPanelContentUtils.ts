// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IChoiceGroupOption } from "@fluentui/react";
import { localization } from "@responsible-ai/localization";
import { ICategoricalRange, INumericRange } from "@responsible-ai/mlchartlib";

import { DatasetCohortColumns } from "../../DatasetCohortColumns";
import { JointDataset } from "../../util/JointDataset";

export function getChoices(columnRanges?: {
  [key: string]: INumericRange | ICategoricalRange;
}): IChoiceGroupOption[] {
  const choices = [
    {
      id: "0",
      key: DatasetCohortColumns.Index,
      text: localization.Interpret.CohortEditor.choiceGroup.index
    },
    {
      id: "1",
      key: DatasetCohortColumns.Dataset,
      text: localization.Interpret.CohortEditor.choiceGroup.dataset
    },
    {
      id: "2",
      key: DatasetCohortColumns.PredictedY,
      text: localization.Interpret.CohortEditor.choiceGroup.predictedY
    },
    {
      id: "3",
      key: DatasetCohortColumns.TrueY,
      text: localization.Interpret.CohortEditor.choiceGroup.trueY
    }
  ];
  if (columnRanges && columnRanges[DatasetCohortColumns.ClassificationError]) {
    choices.push({
      id: choices.length.toString(),
      key: DatasetCohortColumns.ClassificationError,
      text: localization.Interpret.CohortEditor.choiceGroup
        .classificationOutcome
    });
  }
  if (columnRanges && columnRanges[DatasetCohortColumns.RegressionError]) {
    choices.push({
      id: choices.length.toString(),
      key: DatasetCohortColumns.RegressionError,
      text: localization.Interpret.CohortEditor.choiceGroup.regressionError
    });
  }
  return choices;
}

export function getLegacyChoices(
  jointDataset: JointDataset
): IChoiceGroupOption[] {
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
      previousValue.push({
        id: previousValue.length.toString(),
        key,
        text: "Dataset"
      });
      return previousValue;
    }
    if (metaVal === undefined) {
      return previousValue;
    }
    previousValue.push({
      id: previousValue.length.toString(),
      key,
      text: metaVal.abbridgedLabel
    });
    return previousValue;
  }, []);
}

export function getFilterLabel(column: string): string {
  const filters = getChoices();
  let label = column;
  filters.forEach((filter) => {
    if (filter.key === column) {
      label = filter.text;
    }
  });
  return label;
}

export const legacyFilterArgRetainableList = [
  JointDataset.PredictedYLabel,
  JointDataset.TrueYLabel,
  JointDataset.ClassificationError
];

export const filterArgRetainableList = [
  DatasetCohortColumns.PredictedY,
  DatasetCohortColumns.TrueY,
  DatasetCohortColumns.ClassificationError
];
