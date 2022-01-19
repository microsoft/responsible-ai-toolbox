// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { getMenu } from "../../../../util/getMenu";
import { RAINotebookNames } from "../../IModelAssessmentData";
import { modelAssessmentDatasets } from "../../modelAssessmentDatasets";

import { describeTabularDataView } from "./describeTabularDataView";

const testName = "Individual feature importance";

export function describeIndividualFeatureImportance(
  name: keyof typeof modelAssessmentDatasets
): void {
  const datasetShape = modelAssessmentDatasets[name];
  if (datasetShape.featureImportanceData?.noFeatureImportance) {
    return;
  }
  describe(testName, () => {
    before(() => {
      const hosts = Cypress.env().hosts;
      const hostDetails = hosts.find((obj: { file: string }) => {
        return obj.file === RAINotebookNames[name];
      });
      cy.task("log", hostDetails.host);
      cy.visit(hostDetails.host);
      cy.get("#ModelAssessmentDashboard").should("exist");
    });
    if (datasetShape.featureImportanceData?.noDataset) {
      it("should render no data message", () => {
        cy.get("#MissingParameterPlaceHolder").contains(
          "This tab requires an evaluation dataset be supplied."
        );
      });
      return;
    }
    if (!datasetShape.featureImportanceData?.hasFeatureImportanceComponent) {
      it("should not have 'Feature importance' for decision making notebooks", () => {
        getMenu("Individual feature importance").should("not.exist");
      });
    }
    if (datasetShape.featureImportanceData?.hasFeatureImportanceComponent) {
      describeTabularDataView(datasetShape);
    }
  });
}
