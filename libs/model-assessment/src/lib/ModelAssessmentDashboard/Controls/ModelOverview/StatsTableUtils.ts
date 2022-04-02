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

export function wrapYAxisLabels(obj: any, wrapOnWhitespace: boolean = false) {
  var label = obj.toString();
  for (let index = 20; index < label.length; index += 20) {
    // check if there are suitable spots for a linewrap
    // if not just wrap after 20 characters
    const closing_parenthesis = ") ";
    const opening_parenthesis = " (";
    const whitespace = " ";
    const searchString = label.slice(index - 10, index);
    if (searchString.includes(closing_parenthesis)) {
      index = label.indexOf(closing_parenthesis, index - 10) + 2;
    } else if (searchString.includes(opening_parenthesis)) {
      index = label.indexOf(opening_parenthesis, index - 10) + 1;
    } else if (wrapOnWhitespace && searchString.includes(whitespace)) {
      index = label.indexOf(whitespace, index - 10) + 1;
    }
    label = label.slice(0, index) + "<br />" + label.slice(index, label.length);
  }
  if (label.length > 40) {
    label = label.slice(0, 37) + "...";
  }
  return label;
}
