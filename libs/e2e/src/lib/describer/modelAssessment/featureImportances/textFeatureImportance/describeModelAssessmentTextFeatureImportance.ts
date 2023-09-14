// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { getMenu } from "../../../../../util/getMenu";
import { selectRow } from "../../../../../util/Table";
import { visit } from "../../../../../util/visit";
import { describeTextIndividualFeatureImportance } from "../../../interpretText/individualFeatureImportance/describeTextIndividualFeatureImportance";
import { Locators } from "../../Constants";
import { modelAssessmentDatasets } from "../../datasets/modelAssessmentDatasets";
import { IModelAssessmentData } from "../../IModelAssessmentData";

const testName = "Model assessment text feature importance";

export function describeModelAssessmentTextFeatureImportance(
  datasetShape: IModelAssessmentData,
  name?: keyof typeof modelAssessmentDatasets
): void {
  describe(testName, () => {
    before(() => {
      visit(name);
      cy.get("#ModelAssessmentDashboard").should("exist");
      cy.get(Locators.DataAnalysisTab).eq(0).click();
    });
    before(() => {
      getMenu("Individual feature importance").click();
    });
    if (datasetShape.textExplanationData) {
      const textExplanationData = datasetShape.textExplanationData;
      it("should be able to select a table row for testing", () => {
        if (textExplanationData.expandCorrect) {
          cy.get(Locators.IFICollapseButton).first().click();
        }
        selectRow(
          "Index",
          textExplanationData.explanationIndex.toString(),
          Locators.IFIContainer
        );
      });
      describeTextIndividualFeatureImportance(textExplanationData);
    } else {
      throw new Error(`Missing feature importances on ${name}`);
    }
  });
}
