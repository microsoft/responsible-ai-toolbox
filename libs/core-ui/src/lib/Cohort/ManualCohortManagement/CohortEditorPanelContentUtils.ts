// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IChoiceGroupOption } from "@fluentui/react";
import { localization } from "@responsible-ai/localization";
import { IColumnRange } from "@responsible-ai/mlchartlib";

import { DatasetCohortColumns } from "../../DatasetCohortColumns";

export const maxLength = 18;

export function getColumnItems(
  columnRanges?: {
    [key: string]: IColumnRange;
  },
  features?: unknown[][]
): IChoiceGroupOption[] {
  const items: IChoiceGroupOption[] = [
    DatasetCohortColumns.Index,
    DatasetCohortColumns.Dataset,
    DatasetCohortColumns.PredictedY,
    DatasetCohortColumns.TrueY,
    DatasetCohortColumns.ClassificationError,
    DatasetCohortColumns.RegressionError
  ].reduce((previousValue: IChoiceGroupOption[], key: string) => {
    const range = columnRanges && columnRanges[key];
    if (
      key === DatasetCohortColumns.Dataset &&
      features &&
      features.length > 0
    ) {
      previousValue.push({
        key,
        text: localization.Interpret.CohortEditor.columns.dataset
      });
      return previousValue;
    }
    if (range === undefined) {
      return previousValue;
    }
    previousValue.push({ key, text: getColumnText(key) });
    return previousValue;
  }, []);
  return items;
}

function getColumnText(key: string): string {
  switch (key) {
    case DatasetCohortColumns.Index:
      return localization.Interpret.CohortEditor.columns.index;
    case DatasetCohortColumns.Dataset:
      return localization.Interpret.CohortEditor.columns.dataset;
    case DatasetCohortColumns.PredictedY:
      return localization.Interpret.CohortEditor.columns.predictedY;
    case DatasetCohortColumns.TrueY:
      return localization.Interpret.CohortEditor.columns.trueY;
    case DatasetCohortColumns.ClassificationError:
      return localization.Interpret.CohortEditor.columns.classificationOutcome;
    case DatasetCohortColumns.RegressionError:
      return localization.Interpret.CohortEditor.columns.regressionError;
    default:
      return "";
  }
}
