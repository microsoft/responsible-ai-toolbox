// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { visit } from "../../../../util/visit";
import { Locators } from "../Constants";
import { modelAssessmentDatasets } from "../datasets/modelAssessmentDatasets";
import { IModelAssessmentData } from "../IModelAssessmentData";

import { describeErrorAnalysisCohortInfo } from "./describeErrorAnalysisCohortInfo";
import { describeErrorAnalysisTreeMap } from "./describeErrorAnalysisTreeMap";

const testName = "Error Analysis";

export function describeErrorAnalysis(
  datasetShape: IModelAssessmentData,
  name?: keyof typeof modelAssessmentDatasets
): void {
  describe(testName, () => {
    before(() => {
      visit(name);
      cy.get("#ModelAssessmentDashboard").should("exist");
    });

    it("should not have error analysis for causal decision making", () => {
      if (!datasetShape.errorAnalysisData?.hasErrorAnalysisComponent) {
        cy.get(Locators.ErrorAnalysisHeader).should("not.exist");
      }
    });

    it("should have error analysis for model debugging", () => {
      if (datasetShape.errorAnalysisData?.hasErrorAnalysisComponent) {
        cy.get(Locators.ErrorAnalysisHeader).should("exist");
      }
    });

    if (datasetShape.errorAnalysisData?.hasErrorAnalysisComponent) {
      describeErrorAnalysisCohortInfo();
      describeErrorAnalysisTreeMap();
    }
  });
}
