// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { RAINotebookNames } from "../IModelAssessmentData";
import { modelAssessmentDatasets } from "../modelAssessmentDatasets";

import { describeModelPerformanceBoxChart } from "./describeModelPerformanceBoxChart";
import { describeModelPerformanceSideBar } from "./describeModelPerformanceSideBar";

const testName = "Model Statistics";

export function describeModelStatistics(
  name: keyof typeof modelAssessmentDatasets
): void {
  describe(testName, () => {
    const datasetShape = modelAssessmentDatasets[name];
    before(() => {
      const hosts = Cypress.env().hosts;
      const hostDetails = hosts.find((obj: { file: string }) => {
        return obj.file === RAINotebookNames[name];
      });
      cy.task("log", hostDetails.host);
      cy.visit(hostDetails.host);
    });
    describeModelPerformanceBoxChart(datasetShape);
    describeModelPerformanceSideBar(datasetShape);
  });
}
