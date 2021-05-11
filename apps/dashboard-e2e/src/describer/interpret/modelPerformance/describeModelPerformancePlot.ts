// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { getMenu } from "../../../util/getMenu";
import { interpretDatasets } from "../interpretDatasets";

import { describeAxisConfigDialog } from "./describeAxisConfigDialog";
import { describeModelPerformanceStats } from "./describeModelPerformanceStats";

const testName = "Model performance plot";
export function describeModelPerformancePlot(
  name: keyof typeof interpretDatasets
): void {
  const datasetShape = interpretDatasets[name];
  if (datasetShape.noDataset) return;

  if (datasetShape.noPredict) return;

  if (datasetShape.noY) return;

  describe(testName, () => {
    beforeEach(() => {
      cy.visit(`#/interpret/${name}/light/english/Version-2`);
    });
    beforeEach(() => {
      getMenu("Model performance", "#DashboardPivot").click();
    });
    describe("Model performance Chart", () => {
      describeAxisConfigDialog();
    });
    describe("Model performance stats", () => {
      describeModelPerformanceStats(datasetShape);
    });
  });
}
