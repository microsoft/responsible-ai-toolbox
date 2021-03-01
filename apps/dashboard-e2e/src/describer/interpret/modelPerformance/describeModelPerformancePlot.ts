// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { getMenu } from "../../../util/getMenu";
import { IInterpretData } from "../IInterpretData";

import { describeAxisConfigDialog } from "./describeAxisConfigDialog";
import { describeModelPerformanceStats } from "./describeModelPerformanceStats";

export function describeModelPerformancePlot(dataShape: IInterpretData): void {
  describe("Model performance plot", () => {
    beforeEach(() => {
      getMenu("Model performance", "#DashboardPivot").click();
    });
    describe("Model performance Chart", () => {
      describeAxisConfigDialog();
    });
    describe("Model performance stats", () => {
      describeModelPerformanceStats(dataShape);
    });
  });
}
