// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { RAINotebookNames } from "../IModelAssessmentData";
import { modelAssessmentDatasets } from "../modelAssessmentDatasets";

import { describeAxisFlyouts } from "./describeAxisFlyouts";
import { describeWhatIfCommonFunctionalities } from "./describeWhatIfCommonFunctionalities";
import { describeWhatIfCreate } from "./describeWhatIfCreate";

const testName = "What If";

export function describeWhatIf(
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
      cy.get("#ModelAssessmentDashboard").should("exist");
    });
    describeWhatIfCommonFunctionalities(datasetShape);
    describeAxisFlyouts(datasetShape);
    describeWhatIfCreate(datasetShape);
  });
}
