// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { getMenu } from "../../../../../util/getMenu";
import { visit } from "../../../../../util/visit";
import { Locators } from "../../Constants";
import { modelAssessmentDatasets } from "../../datasets/modelAssessmentDatasets";
import { IModelAssessmentData } from "../../IModelAssessmentData";

import { describeTabularDataView } from "./describeTabularDataView";

const testName = "Individual feature importance";

export function describeIndividualFeatureImportance(
  datasetShape: IModelAssessmentData,
  name?: keyof typeof modelAssessmentDatasets
): void {
  if (datasetShape.featureImportanceData?.noFeatureImportance) {
    return;
  }
  describe(testName, () => {
    before(() => {
      visit(name);
      cy.get("#ModelAssessmentDashboard").should("exist");
      cy.get(Locators.DataAnalysisTab).eq(0).click();
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
      describeTabularDataView(datasetShape, name);
    }
  });
}
