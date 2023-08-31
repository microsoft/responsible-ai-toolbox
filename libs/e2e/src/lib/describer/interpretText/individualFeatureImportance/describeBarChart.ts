// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Locators } from "../Constants";
import {
  checkNumBars,
  checkYAxisLabel,
  checkNumLabels
} from "../validateBarChart";

export function describeBarChart(expectedNumValues: number): void {
  describe("Sub bar chart", () => {
    it("should have right number of bars", () => {
      checkNumBars(Locators.TextExplanationChart, expectedNumValues);
    });
    it("should have y axis with matched value", () => {
      checkYAxisLabel(Locators.TextExplanationChart);
    });
    it("should have right number of x axis labels", () => {
      checkNumLabels(Locators.TextExplanationChart, expectedNumValues);
    });
  });
}
