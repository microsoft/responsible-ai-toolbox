// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Locators } from "../../Constants";
import {
  IModelAssessmentData,
  RAINotebookNames
} from "../../IModelAssessmentData";
import { modelAssessmentDatasets } from "../../modelAssessmentDatasets";

const testName = "Model Overview v2";

export function describeNewModelOverview(
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
    it("should have 'Model overview' component for the notebook", () => {
      cy.get(Locators.ModelOverviewHeader).should("exist");
      cy.get(Locators.ModelOverviewDescription).should("exist");
      cy.get(Locators.ModelOverviewCohortViewSelector).should("exist");
    });
    it("should find initial cohort in heatmap", () => {
      console.log(datasetShape.cohortDefaultName);
    });
  });
}
