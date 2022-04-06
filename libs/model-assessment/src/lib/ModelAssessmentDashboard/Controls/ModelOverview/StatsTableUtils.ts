// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { ErrorCohort, ILabeledStatistic } from "@responsible-ai/core-ui";
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
            color: "#808080",
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
  const searchString = new Set(label.slice(startingPosition, slicingIndex));

  if (wrapOnWhitespace && searchString.has(whitespace)) {
    // option 3: wrap after maxLineLength characters
    slicingIndex = label.indexOf(whitespace, startingPosition) + 1;
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
