// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  BinaryClassificationMetrics,
  classificationTask,
  ErrorCohort,
  ILabeledStatistic,
  RegressionMetrics
} from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";
import { PointOptionsObject } from "highcharts";
import { IDropdownOption } from "office-ui-fabric-react";

export function generateCohortsStatsTable(
  cohorts: ErrorCohort[],
  selectableMetrics: IDropdownOption[],
  labeledStatistics: ILabeledStatistic[][],
  selectedMetrics: string[]
) {
  const items: PointOptionsObject[] = cohorts.map(
    (errorCohort, cohortIndex) => {
      return {
        colorValue: 0,
        value: errorCohort.cohortStats.totalCohort,

        x: 0,
        // metric index for Count column
        y: cohortIndex
      };
    }
  );
  selectableMetrics
    .filter((element: IDropdownOption) =>
      selectedMetrics.includes(element.key.toString())
    )
    .forEach((metricOption: IDropdownOption, metricIndex: number) => {
      // first determine min and max values
      let metricMin = Number.MAX_SAFE_INTEGER;
      let metricMax = Number.MIN_SAFE_INTEGER;
      cohorts.forEach((_errorCohort, cohortIndex) => {
        const labeledStat = labeledStatistics[cohortIndex].find(
          (labeledStat) => labeledStat.key === metricOption.key
        );
        if (labeledStat) {
          if (labeledStat.stat > metricMax) {
            metricMax = labeledStat.stat;
          }
          if (labeledStat.stat < metricMin) {
            metricMin = labeledStat.stat;
          }
        }
      });
      // use min and max to normalize the colors
      const metricMinMaxDiff = metricMax - metricMin;
      cohorts.forEach((_errorCohort, cohortIndex) => {
        const labeledStat = labeledStatistics[cohortIndex].find(
          (labeledStat) => labeledStat.key === metricOption.key
        );
        if (labeledStat && !Number.isNaN(labeledStat.stat)) {
          items.push({
            colorValue: (labeledStat.stat - metricMin) / metricMinMaxDiff,
            value: Number(labeledStat.stat.toFixed(3)),
            x: metricIndex + 1,
            y: cohortIndex
          });
        } else {
          // not a numeric value (NaN), so just put null and use color gray
          items.push({
            color: {
              pattern: {
                path: {
                  d: "M 0 0 L 10 10 M 9 -1 L 11 1 M -1 9 L 1 11",
                  strokeWidth: 3
                },
                aspectRatio: 1,
                backgroundColor: "white",
                color: "pink",
                height: 10,
                image: "",
                opacity: 0.5,
                patternTransform: "",
                width: 10
              }
            },
            value: Number.NaN,
            x: metricIndex + 1,
            y: cohortIndex
          });
        }
      });
    });
  return items;
}

export function wrapYAxisLabels(label: string, wrapOnWhitespace = false) {
  const maxLineLength = 40;

  if (label.length <= maxLineLength) {
    // label is short enough to fit on one line
    return label;
  }

  const maxLines = 2;
  const lineWrapHtmlTag = "<br />";
  const ellipsis = "...";

  // check if there are suitable spots for a linewrap
  // if not just wrap after maxLineLength characters
  // consider suitable wrapping spots based on whitespace
  // starting at half the line length
  const startingPosition = maxLineLength / 2;
  let slicingIndex = maxLineLength;
  const whitespace = " ";

  if (wrapOnWhitespace) {
    // find last whitespace in the first line
    for (var index = maxLineLength - 1; index >= startingPosition; index -= 1) {
      if (label[index] === whitespace) {
        slicingIndex = index;
        break;
      }
    }
  }
  label =
    label.slice(0, slicingIndex) +
    lineWrapHtmlTag +
    label.slice(slicingIndex, label.length);

  const maxLabelLength = maxLineLength * maxLines + lineWrapHtmlTag.length;
  if (label.length > maxLabelLength) {
    // cut off label and add ellipsis at the end
    label = label.slice(0, maxLabelLength - ellipsis.length) + ellipsis;
  }
  return label;
}

export function getSelectableMetrics(
  taskType: "classification" | "regression"
) {
  const selectableMetrics: IDropdownOption[] = [];
  if (taskType === classificationTask) {
    // TODO: add case for multiclass classification
    selectableMetrics.push(
      {
        key: BinaryClassificationMetrics.Accuracy,
        text: localization.ModelAssessment.ModelOverview.accuracy
      },
      {
        key: BinaryClassificationMetrics.F1Score,
        text: localization.ModelAssessment.ModelOverview.f1Score
      },
      {
        key: BinaryClassificationMetrics.Precision,
        text: localization.ModelAssessment.ModelOverview.precision
      },
      {
        key: BinaryClassificationMetrics.Recall,
        text: localization.ModelAssessment.ModelOverview.recall
      },
      {
        key: BinaryClassificationMetrics.FalsePositiveRate,
        text: localization.ModelAssessment.ModelOverview.falsePositiveRate
      },
      {
        key: BinaryClassificationMetrics.FalseNegativeRate,
        text: localization.ModelAssessment.ModelOverview.falseNegativeRate
      },
      {
        key: BinaryClassificationMetrics.SelectionRate,
        text: localization.ModelAssessment.ModelOverview.selectionRate
      }
    );
  } else {
    // task_type === "regression"
    selectableMetrics.push(
      {
        key: RegressionMetrics.MeanAbsoluteError,
        text: localization.ModelAssessment.ModelOverview.meanAbsoluteError
      },
      {
        key: RegressionMetrics.MeanSquaredError,
        text: localization.ModelAssessment.ModelOverview.meanSquaredError
      },
      {
        key: RegressionMetrics.MeanPrediction,
        text: localization.ModelAssessment.ModelOverview.meanPrediction
      }
    );
  }
  return selectableMetrics;
}
