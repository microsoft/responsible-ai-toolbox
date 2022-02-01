// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { modelAssessmentDatasets } from "../modelAssessmentDatasets";

import { describeAxisConfigDialog } from "./describeAxisConfigDialog";
import { describeModelPerformanceStats } from "./describeModelPerformanceStats";

const testName = "Model overview";
export function describeModelOverview(
  name: keyof typeof modelAssessmentDatasets
): void {
  describe(testName, () => {
    before(() => {
      cy.visit(`#/modelAssessment/${name}/light/english/Version-2`);
    });
    it("Model overview title", () => {
      cy.get("#modelStatisticsHeader").contains("Model overview");
    })
    describe("Model performance Chart", () => {
      describeAxisConfigDialog();
    });
    describe("Model performance stats", () => {
      describeModelPerformanceStats(modelAssessmentDatasets[name]);
    });
  });
}
