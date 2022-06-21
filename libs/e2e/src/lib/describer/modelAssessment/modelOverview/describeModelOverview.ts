// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Locators } from "../Constants";
import {
  IModelAssessmentData,
  RAINotebookNames
} from "../IModelAssessmentData";
import { modelAssessmentDatasets } from "../modelAssessmentDatasets";

import { describeModelPerformanceBoxChart } from "./describeModelPerformanceBoxChart";
import { describeModelPerformanceSideBar } from "./describeModelPerformanceSideBar";

const testName = "Model Overview v1";

export function describeModelOverview(
  datasetShape: IModelAssessmentData,
  name?: keyof typeof modelAssessmentDatasets
): void {
  describe(testName, () => {
    before(() => {
      if (name) {
        const hosts = Cypress.env().hosts;
        const hostDetails = hosts.find((obj: { file: string }) => {
          return obj.file === RAINotebookNames[name];
        });
        cy.task("log", hostDetails.host);
        cy.visit(hostDetails.host);
      }
    });
    if (!datasetShape.modelStatisticsData?.hasModelStatisticsComponent) {
      it("should not have 'Model statistics' component for the notebook", () => {
        cy.get(Locators.ModelOverviewHeader).should("not.exist");
      });
    }
    if (datasetShape.modelStatisticsData?.hasModelStatisticsComponent) {
      describeModelPerformanceBoxChart(datasetShape);
      if (datasetShape.modelStatisticsData.hasSideBar) {
        describeModelPerformanceSideBar(datasetShape);
      }
    }
  });
}
