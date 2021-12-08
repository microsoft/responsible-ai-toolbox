// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { RAINotebookNames } from "../IModelAssessmentData";
import { modelAssessmentDatasets } from "../modelAssessmentDatasets";

import { describeAggregatePlot } from "./describeAggregatePlot";

const testName = "Dataset explorer";

export function describeDatasetExplorer(
  name: keyof typeof modelAssessmentDatasets
): void {
  const datasetShape = modelAssessmentDatasets[name];
  describe(testName, () => {
    before(() => {
      const hosts = Cypress.env().hosts;
      const hostDetails = hosts.find((obj: { file: string }) => {
        return obj.file === RAINotebookNames[name];
      });
      cy.task("log", hostDetails.host);
      cy.visit(hostDetails.host);
      cy.get("#ModelAssessmentDashboard").should("exist");
      // getMenu("Dataset explorer", "#DashboardPivot").click();
    });
    if (datasetShape.featureImportanceData?.noDataset) {
      it("should render no data message", () => {
        cy.get("#MissingParameterPlaceHolder").contains(
          "This tab requires an evaluation dataset be supplied."
        );
      });
      return;
    }
    describeAggregatePlot(datasetShape);
  });
}
