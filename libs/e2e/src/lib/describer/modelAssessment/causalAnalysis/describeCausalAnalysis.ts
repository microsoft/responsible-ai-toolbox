// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Locators } from "../Constants";
import { modelAssessmentDatasets } from "../datasets/modelAssessmentDatasets";
import {
  IModelAssessmentData,
  RAINotebookNames
} from "../IModelAssessmentData";

import { describeAggregateCausalAffects } from "./describeAggregateCausalAffects";

const testName = "Causal Analysis";

export function describeCausalAnalysis(
  datasetShape: IModelAssessmentData,
  name?: keyof typeof modelAssessmentDatasets
): void {
  describe(testName, () => {
    let fileName: string;
    before(() => {
      if (name) {
        const hosts = Cypress.env().hosts;
        const hostDetails = hosts.find((obj: { file: string }) => {
          fileName = RAINotebookNames[name];
          return obj.file === fileName;
        });
        cy.task("log", hostDetails.host);
        cy.visit(hostDetails.host);
      }
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
