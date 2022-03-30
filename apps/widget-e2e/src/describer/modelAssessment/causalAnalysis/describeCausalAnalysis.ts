// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Locators } from "../Constants";
import { RAINotebookNames } from "../IModelAssessmentData";
import { modelAssessmentDatasets } from "../modelAssessmentDatasets";

import { describeAggregateCausalAffects } from "./describeAggregateCausalAffects";

const testName = "Causal Analysis";

export function describeCausalAnalysis(
  name: keyof typeof modelAssessmentDatasets
): void {
  const datasetShape = modelAssessmentDatasets[name];
  describe(testName, () => {
    let fileName: string;
    before(() => {
      const hosts = Cypress.env().hosts;
      const hostDetails = hosts.find((obj: { file: string }) => {
        fileName = RAINotebookNames[name];
        return obj.file === fileName;
      });
      cy.task("log", hostDetails.host);
      cy.visit(hostDetails.host);
      cy.get("#ModelAssessmentDashboard").should("exist");
    });

    it("should not have causal analysis for model debugging", () => {
      if (!datasetShape.causalAnalysisData?.hasCausalAnalysisComponent) {
        cy.get(Locators.CausalAnalysisHeader).should("not.exist");
      }
    });

    if (datasetShape.causalAnalysisData?.hasCausalAnalysisComponent) {
      describeAggregateCausalAffects(datasetShape);
    }
  });
}
