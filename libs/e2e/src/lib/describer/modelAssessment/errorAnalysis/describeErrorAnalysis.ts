// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Locators } from "../Constants";
import { modelAssessmentDatasets } from "../datasets/modelAssessmentDatasets";
import {
  IModelAssessmentData,
  RAINotebookNames
} from "../IModelAssessmentData";

import { describeErrorAnalysisCohortInfo } from "./describeErrorAnalysisCohortInfo";
import { describeErrorAnalysisTreeMap } from "./describeErrorAnalysisTreeMap";

const testName = "Error Analysis";

export function describeErrorAnalysis(
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
