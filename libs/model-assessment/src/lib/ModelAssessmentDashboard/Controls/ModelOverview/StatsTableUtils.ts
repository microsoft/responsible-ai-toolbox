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

export interface IFairnessStats {
  max: number;
  min: number;
  maxCohortName: string;
  minCohortName: string;
  difference: number;
  ratio: number | undefined;
}

export function generateCohortsStatsTable(
  cohorts: ErrorCohort[],
  selectableMetrics: IDropdownOption[],
  labeledStatistics: ILabeledStatistic[][],
  selectedMetrics: string[]
) {
  // The "count" metric has to be treated separately
  // since it's not handled like other metrics, but
  // is part of the ErrorCohort object.
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
  let countMax = Number.MIN_SAFE_INTEGER;
  let countMin = Number.MAX_SAFE_INTEGER;
  let countMinCohortName = "";
  let countMaxCohortName = "";
  cohorts.forEach((errorCohort) => {
    const cohortCount = errorCohort.cohortStats.totalCohort;
    if (cohortCount > countMax) {
      countMax = cohortCount;
      countMaxCohortName = errorCohort.cohort.name;
    }
    if (cohortCount < countMin) {
      countMin = cohortCount;
      countMinCohortName = errorCohort.cohort.name;
    }
  });
  const fairnessStats: IFairnessStats[] = [
    {
      difference: countMax - countMin,
      max: countMax,
      maxCohortName: countMaxCohortName,
      min: countMin,
      minCohortName: countMinCohortName,
      ratio: countMin / countMax
    }
  ];
  selectableMetrics
    .filter((element: IDropdownOption) =>
      selectedMetrics.includes(element.key.toString())
    )
    .forEach((metricOption: IDropdownOption, metricIndex: number) => {
      // first determine min and max values
      let metricMin = Number.MAX_SAFE_INTEGER;
      let metricMinCohortName = "";
      let metricMax = Number.MIN_SAFE_INTEGER;
      let metricMaxCohortName = "";
      cohorts.forEach((errorCohort, cohortIndex) => {
        const labeledStat = labeledStatistics[cohortIndex].find(
          (labeledStat) => labeledStat.key === metricOption.key
        );
        if (labeledStat) {
          if (labeledStat.stat > metricMax) {
            metricMax = labeledStat.stat;
            metricMaxCohortName = errorCohort.cohort.name;
          }
          if (labeledStat.stat < metricMin) {
            metricMin = labeledStat.stat;
            metricMinCohortName = errorCohort.cohort.name;
          }
        }
      });
      // use min and max to normalize the colors
      const metricMinMaxDiff = metricMax - metricMin;
      let metricMinMaxRatio: number | undefined = undefined;
      if (metricMax !== 0) {
        metricMinMaxRatio = metricMin / metricMax;
      }
      const metricFairnessStats: IFairnessStats = {
        difference: metricMinMaxDiff,
        max: metricMax,
        maxCohortName: metricMaxCohortName,
        min: metricMin,
        minCohortName: metricMinCohortName,
        ratio: metricMinMaxRatio
      };
      fairnessStats.push(metricFairnessStats);
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
          // not a numeric value (NaN), so just put null and use textured color
          items.push({
            color: {
              pattern: {
                aspectRatio: 1,
                backgroundColor: "white",
                color: "pink",
                height: 10,
                image: "",
                opacity: 0.5,
                path: {
                  d: "M 0 0 L 10 10 M 9 -1 L 11 1 M -1 9 L 1 11",
                  strokeWidth: 3
                },
                patternTransform: "",
                width: 10
              }
            },
            // null is treated as a special value by highcharts
            // sadly there's no alternative (undefined doesn't work)
            // eslint-disable-next-line unicorn/no-null
            value: null,
            x: metricIndex + 1,
            y: cohortIndex
          });
        }
      });
    });
  return { fairnessStats, items };
}

export function wrapYAxisLabels(label: string, wrapOnWhitespace = true) {
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
    for (let index = maxLineLength - 1; index >= startingPosition; index -= 1) {
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
