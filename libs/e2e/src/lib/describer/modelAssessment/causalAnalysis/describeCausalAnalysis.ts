// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { visit } from "../../../../util/visit";
import { Locators } from "../Constants";
import { modelAssessmentDatasets } from "../datasets/modelAssessmentDatasets";
import { IModelAssessmentData } from "../IModelAssessmentData";

import { describeAggregateCausalAffects } from "./describeAggregateCausalAffects";

const testName = "Causal Analysis";

export function describeCausalAnalysis(
  datasetShape: IModelAssessmentData,
  name?: keyof typeof modelAssessmentDatasets
): void {
  describe(testName, () => {
    before(() => {
      visit(name);
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
