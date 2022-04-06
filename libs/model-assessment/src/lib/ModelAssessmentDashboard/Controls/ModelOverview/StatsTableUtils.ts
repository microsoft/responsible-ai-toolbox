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
  let items: PointOptionsObject[] = cohorts.map((errorCohort, cohortIndex) => {
    return {
      x: 0, // metric index for Count column
      y: cohortIndex,
      value: errorCohort.cohortStats.totalCohort,
      colorValue: 0
    };
  });
  selectableMetrics
    .filter((element: IDropdownOption) =>
      selectedMetrics.includes(element.key.toString())
    )
    .forEach((metricOption: IDropdownOption, metricIndex: number) => {
      // first determine min and max values
      let metricMin = Number.MAX_SAFE_INTEGER;
      let metricMax = Number.MIN_SAFE_INTEGER;
      cohorts.forEach((_errorCohort, cohortIndex) => {
        const stat = labeledStatistics[cohortIndex].find(
          (stat) => stat.key === metricOption.key
        );
        if (stat) {
          if (stat.stat > metricMax) {
            metricMax = stat.stat;
          }
          if (stat.stat < metricMin) {
            metricMin = stat.stat;
          }
        }
      });
      // use min and max to normalize the colors
      const metricMinMaxDiff = metricMax - metricMin;
      cohorts.forEach((_errorCohort, cohortIndex) => {
        const stat = labeledStatistics[cohortIndex].find(
          (stat) => stat.key === metricOption.key
        );
        if (stat && !Number.isNaN(stat.stat)) {
          items.push({
            x: metricIndex + 1,
            y: cohortIndex,
            value: Number(stat.stat.toFixed(3)),
            colorValue: (stat.stat - metricMin) / metricMinMaxDiff
          });
        } else {
          // not a numeric value (NaN), so just put null
          items.push({
            x: metricIndex + 1,
            y: cohortIndex,
            value: Number.NaN,
            color: "#808080" // gray
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
  let slicingIndex = maxLineLength;
  const closingParenthesis = ") ";
  const openingParenthesis = " (";
  const whitespace = " ";
  const searchString = new Set(
    label.slice(slicingIndex - maxLineLength / 2, slicingIndex)
  );

  if (searchString.has(closingParenthesis)) {
    // option 1: wrap after closing parenthesis
    slicingIndex =
      label.indexOf(closingParenthesis, slicingIndex - maxLineLength / 2) + 2;
  } else if (searchString.has(openingParenthesis)) {
    // option 2: wrap before opening parenthesis
    slicingIndex =
      label.indexOf(openingParenthesis, slicingIndex - maxLineLength / 2) + 1;
  } else if (wrapOnWhitespace && searchString.has(whitespace)) {
    // option 3: wrap after maxLineLength characters
    slicingIndex =
      label.indexOf(whitespace, slicingIndex - maxLineLength / 2) + 1;
  }
  label =
    label.slice(0, slicingIndex) +
    lineWrapHtmlTag +
    label.slice(slicingIndex, label.length);

  if (label.length > maxLineLength * maxLines + lineWrapHtmlTag.length) {
    label =
      label.slice(
        0,
        maxLineLength * maxLines - ellipsis.length + lineWrapHtmlTag.length
      ) + ellipsis;
  }
  return label;
}
