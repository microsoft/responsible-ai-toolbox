// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { visit } from "../../../../util/visitVision";
import { Locators } from "../../modelAssessmentVision/Constants";
import { IModelAssessmentData } from "../../modelAssessmentVision/IModelAssessmentData";
import { modelAssessmentVisionDatasets } from "../datasets/modelAssessmentVisionDatasets";

const testName = "Vision Dataset explorer";

export function describeVisionDatasetExplorer(
  datasetShape: IModelAssessmentData,
  name?: keyof typeof modelAssessmentVisionDatasets
): void {
  describe(testName, () => {
    before(() => {
      visit(name);
      cy.get("#ModelAssessmentDashboard").should("exist");
      cy.get(Locators.DataAnalysisTab).eq(1).click();
    });
    if (datasetShape.featureImportanceData?.noDataset) {
      it("should render no data message", () => {
        cy.get("#MissingParameterPlaceHolder").contains(
          "This tab requires an evaluation dataset be supplied."
        );
      });
      return;
    }
  });
}
