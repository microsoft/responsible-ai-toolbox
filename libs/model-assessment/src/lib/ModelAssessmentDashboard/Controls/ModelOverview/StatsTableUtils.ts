// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { getTheme, IDropdownOption } from "@fluentui/react";
import {
  BinaryClassificationMetrics,
  DatasetTaskType,
  ErrorCohort,
  HighchartsNull,
  ILabeledStatistic,
  ImageClassificationMetrics,
  MulticlassClassificationMetrics,
  MultilabelMetrics,
  ObjectDetectionMetrics,
  QuestionAnsweringMetrics,
  RegressionMetrics,
  TotalCohortSamples
} from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";
import { PointOptionsObject } from "highcharts";

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
  selectedMetrics: string[],
  useTexturedBackgroundForNaN: boolean
): {
  fairnessStats: IFairnessStats[];
  items: PointOptionsObject[];
} {
  const items: PointOptionsObject[] = labeledStatistics.map(
    (labeledStatistic, cohortIndex) => {
      const cohortStats = labeledStatistic.find(
        (cohortStats: ILabeledStatistic) =>
          cohortStats.key === TotalCohortSamples
      );
      if (cohortStats) {
        return {
          colorValue: 0,
          value: cohortStats.stat,
          x: 0,
          // metric index for Count column
          y: cohortIndex
        };
      }
      return {
        colorValue: 0,
        value: 0,
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
  cohorts.forEach((errorCohort, cohortIndex) => {
    const labeledStat = labeledStatistics[cohortIndex].find(
      (labeledStat) => labeledStat.key === TotalCohortSamples
    );
    if (labeledStat) {
      if (labeledStat.stat > countMax) {
        countMax = labeledStat.stat;
        countMaxCohortName = errorCohort.cohort.name;
      }
      if (labeledStat.stat < countMin) {
        countMin = labeledStat.stat;
        countMinCohortName = errorCohort.cohort.name;
      }
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
          let colorValue = (labeledStat.stat - metricMin) / metricMinMaxDiff;
          if (metricMin === metricMax) {
            // only 1 unique value in the set, set color to 0
            colorValue = 0;
          }
          const colorConfig = { color: "transparent" };
          items.push({
            ...colorConfig,
            colorValue,
            value: Number(labeledStat.stat.toFixed(3)),
            x: metricIndex + 1,
            y: cohortIndex
          });
        } else {
          const theme = getTheme();
          // not a numeric value (NaN), so just put null and use textured color
          const colorConfig = useTexturedBackgroundForNaN
            ? {
                color: {
                  pattern: {
                    aspectRatio: 1,
                    backgroundColor: theme.semanticColors.bodyBackground,
                    color: theme.palette.magentaLight,
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
                }
              }
            : { color: "transparent" };
          items.push({
            ...colorConfig,
            // null is treated as a special value by highcharts
            // sadly there's no alternative (undefined doesn't work)
            value: HighchartsNull,
            x: metricIndex + 1,
            y: cohortIndex
          });
        }
      });
    });
  return { fairnessStats, items };
}

export function wrapText(
  text: string,
  maxLineLength = 40,
  maxLines = 2,
  lineStart = 0,
  currentLine = 0
): string {
  if (text.length <= lineStart + maxLineLength) {
    // label is short enough to fit on current line
    return text;
  }

  const wrapStartingPosition = lineStart + maxLineLength / 2;
  const lineWrapHtmlTag = "<br />";
  const ellipsis = "...";

  if (currentLine === maxLines - 1 && text.length > lineStart + maxLineLength) {
    return (
      text.slice(0, lineStart + maxLineLength - ellipsis.length) + ellipsis
    );
  }

  // check if there are suitable spots for a linewrap
  // if not just wrap after maxLineLength characters
  // consider suitable wrapping spots based on whitespace
  let slicingIndex = lineStart + maxLineLength;
  const whitespace = " ";

  // find last whitespace in the current line
  for (
    let index = lineStart + maxLineLength - 1;
    index >= wrapStartingPosition;
    index -= 1
  ) {
    if (text[index] === whitespace) {
      slicingIndex = index;
      break;
    }
  }
  text =
    text.slice(0, slicingIndex) +
    lineWrapHtmlTag +
    text.slice(slicingIndex, text.length);

  // check if remainer is still too long for next line
  if (text.length - slicingIndex + lineWrapHtmlTag.length > maxLineLength) {
    // if so call recursively with adjusted window
    text = wrapText(
      text,
      maxLineLength,
      maxLines,
      slicingIndex + lineWrapHtmlTag.length,
      currentLine + 1
    );
  }

  return text;
}

export interface IMetricOption extends IDropdownOption {
  description: string;
}

export function getSelectableMetrics(
  taskType: DatasetTaskType,
  isMulticlass: boolean
): IMetricOption[] {
  const selectableMetrics: IMetricOption[] = [];
  if (
    taskType === DatasetTaskType.Classification ||
    taskType === DatasetTaskType.TextClassification ||
    taskType === DatasetTaskType.ImageClassification
  ) {
    if (isMulticlass) {
      if (taskType === DatasetTaskType.ImageClassification) {
        selectableMetrics.push(
          {
            description:
              localization.ModelAssessment.ModelOverview.metrics.accuracy
                .description,
            key: ImageClassificationMetrics.Accuracy,
            text: localization.ModelAssessment.ModelOverview.metrics.accuracy
              .name
          },
          {
            description:
              localization.ModelAssessment.ModelOverview.metrics.precisionMacro
                .description,
            key: ImageClassificationMetrics.MacroPrecision,
            text: localization.ModelAssessment.ModelOverview.metrics
              .precisionMacro.name
          },
          {
            description:
              localization.ModelAssessment.ModelOverview.metrics.recallMacro
                .description,
            key: ImageClassificationMetrics.MacroRecall,
            text: localization.ModelAssessment.ModelOverview.metrics.recallMacro
              .name
          },
          {
            description:
              localization.ModelAssessment.ModelOverview.metrics.f1ScoreMacro
                .description,
            key: ImageClassificationMetrics.MacroF1,
            text: localization.ModelAssessment.ModelOverview.metrics
              .f1ScoreMacro.name
          },
          {
            description:
              localization.ModelAssessment.ModelOverview.metrics.precisionMicro
                .description,
            key: ImageClassificationMetrics.MicroPrecision,
            text: localization.ModelAssessment.ModelOverview.metrics
              .precisionMicro.name
          },
          {
            description:
              localization.ModelAssessment.ModelOverview.metrics.recallMicro
                .description,
            key: ImageClassificationMetrics.MicroRecall,
            text: localization.ModelAssessment.ModelOverview.metrics.recallMicro
              .name
          },
          {
            description:
              localization.ModelAssessment.ModelOverview.metrics.f1ScoreMicro
                .description,
            key: ImageClassificationMetrics.MicroF1,
            text: localization.ModelAssessment.ModelOverview.metrics
              .f1ScoreMicro.name
          }
        );
      } else {
        selectableMetrics.push({
          description:
            localization.ModelAssessment.ModelOverview.metrics.accuracy
              .description,
          key: MulticlassClassificationMetrics.Accuracy,
          text: localization.ModelAssessment.ModelOverview.metrics.accuracy.name
        });
      }
    } else {
      selectableMetrics.push(
        {
          description:
            localization.ModelAssessment.ModelOverview.metrics.accuracy
              .description,
          key: BinaryClassificationMetrics.Accuracy,
          text: localization.ModelAssessment.ModelOverview.metrics.accuracy.name
        },
        {
          description:
            localization.ModelAssessment.ModelOverview.metrics.f1Score
              .description,
          key: BinaryClassificationMetrics.F1Score,
          text: localization.ModelAssessment.ModelOverview.metrics.f1Score.name
        },
        {
          description:
            localization.ModelAssessment.ModelOverview.metrics.precision
              .description,
          key: BinaryClassificationMetrics.Precision,
          text: localization.ModelAssessment.ModelOverview.metrics.precision
            .name
        },
        {
          description:
            localization.ModelAssessment.ModelOverview.metrics.recall
              .description,
          key: BinaryClassificationMetrics.Recall,
          text: localization.ModelAssessment.ModelOverview.metrics.recall.name
        },
        {
          description:
            localization.ModelAssessment.ModelOverview.metrics.falsePositiveRate
              .description,
          key: BinaryClassificationMetrics.FalsePositiveRate,
          text: localization.ModelAssessment.ModelOverview.metrics
            .falsePositiveRate.name
        },
        {
          description:
            localization.ModelAssessment.ModelOverview.metrics.falseNegativeRate
              .description,
          key: BinaryClassificationMetrics.FalseNegativeRate,
          text: localization.ModelAssessment.ModelOverview.metrics
            .falseNegativeRate.name
        },
        {
          description:
            localization.ModelAssessment.ModelOverview.metrics.selectionRate
              .description,
          key: BinaryClassificationMetrics.SelectionRate,
          text: localization.ModelAssessment.ModelOverview.metrics.selectionRate
            .name
        }
      );
    }
  } else if (
    taskType === DatasetTaskType.MultilabelImageClassification ||
    taskType === DatasetTaskType.MultilabelTextClassification
  ) {
    selectableMetrics.push(
      {
        description:
          localization.ModelAssessment.ModelOverview.metrics.exactMatchRatio
            .description,
        key: MultilabelMetrics.ExactMatchRatio,
        text: localization.ModelAssessment.ModelOverview.metrics.exactMatchRatio
          .name
      },
      {
        description:
          localization.ModelAssessment.ModelOverview.metrics.hammingScore
            .description,
        key: MultilabelMetrics.HammingScore,
        text: localization.ModelAssessment.ModelOverview.metrics.hammingScore
          .name
      }
    );
  } else if (taskType === DatasetTaskType.ObjectDetection) {
    selectableMetrics.push(
      {
        description:
          localization.ModelAssessment.ModelOverview.metrics
            .meanAveragePrecision.description,
        key: ObjectDetectionMetrics.MeanAveragePrecision,
        text: localization.ModelAssessment.ModelOverview.metrics
          .meanAveragePrecision.name
      },
      {
        description:
          localization.ModelAssessment.ModelOverview.metrics.averagePrecision
            .description,
        key: ObjectDetectionMetrics.AveragePrecision,
        text: localization.ModelAssessment.ModelOverview.metrics
          .averagePrecision.name
      },
      {
        description:
          localization.ModelAssessment.ModelOverview.metrics.averageRecall
            .description,
        key: ObjectDetectionMetrics.AverageRecall,
        text: localization.ModelAssessment.ModelOverview.metrics.averageRecall
          .name
      }
    );
  } else if (taskType === DatasetTaskType.QuestionAnswering) {
    selectableMetrics.push(
      {
        description:
          localization.ModelAssessment.ModelOverview.metrics.exactMatchRatio
            .description,
        key: QuestionAnsweringMetrics.ExactMatchRatio,
        text: localization.ModelAssessment.ModelOverview.metrics.exactMatchRatio
          .name
      },
      {
        description:
          localization.ModelAssessment.ModelOverview.metrics.meteorScore
            .description,
        key: QuestionAnsweringMetrics.MeteorScore,
        text: localization.ModelAssessment.ModelOverview.metrics.meteorScore
          .name
      },
      {
        description:
          localization.ModelAssessment.ModelOverview.metrics.f1Score
            .description,
        key: QuestionAnsweringMetrics.F1Score,
        text: localization.ModelAssessment.ModelOverview.metrics.f1Score.name
      },
      {
        description:
          localization.ModelAssessment.ModelOverview.metrics.bleuScore
            .description,
        key: QuestionAnsweringMetrics.BleuScore,
        text: localization.ModelAssessment.ModelOverview.metrics.bleuScore.name
      },

      {
        description:
          localization.ModelAssessment.ModelOverview.metrics.bertScore
            .description,
        key: QuestionAnsweringMetrics.BertScore,
        text: localization.ModelAssessment.ModelOverview.metrics.bertScore.name
      },
      {
        description:
          localization.ModelAssessment.ModelOverview.metrics.rougeScore
            .description,
        key: QuestionAnsweringMetrics.RougeScore,
        text: localization.ModelAssessment.ModelOverview.metrics.rougeScore.name
      }
    );
  } else {
    // task_type === "regression"
    selectableMetrics.push(
      {
        description:
          localization.ModelAssessment.ModelOverview.metrics.meanAbsoluteError
            .description,
        key: RegressionMetrics.MeanAbsoluteError,
        text: localization.ModelAssessment.ModelOverview.metrics
          .meanAbsoluteError.name
      },
      {
        description:
          localization.ModelAssessment.ModelOverview.metrics.meanSquaredError
            .description,
        key: RegressionMetrics.MeanSquaredError,
        text: localization.ModelAssessment.ModelOverview.metrics
          .meanSquaredError.name
      },
      {
        description:
          localization.ModelAssessment.ModelOverview.metrics.meanPrediction
            .description,
        key: RegressionMetrics.MeanPrediction,
        text: localization.ModelAssessment.ModelOverview.metrics.meanPrediction
          .name
      }
    );
  }
  return selectableMetrics;
}
