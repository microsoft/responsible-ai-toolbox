// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { visit } from "../../../../util/visit";
import { Locators } from "../Constants";
import { modelAssessmentDatasets } from "../datasets/modelAssessmentDatasets";
import { IModelAssessmentData } from "../IModelAssessmentData";

import { describeAxisFlyouts } from "./describeAxisFlyouts";
import { describeWhatIfCommonFunctionalities } from "./describeWhatIfCommonFunctionalities";
import { describeWhatIfCreate } from "./describeWhatIfCreate";

const testName = "What If";

export function describeWhatIf(
  datasetShape: IModelAssessmentData,
  name?: keyof typeof modelAssessmentDatasets
): void {
  describe(testName, () => {
    before(() => {
      visit(name);
      cy.get("#ModelAssessmentDashboard").should("exist");
    });
    if (
      !datasetShape.whatIfCounterfactualsData?.hasWhatIfCounterfactualsComponent
    ) {
      it("should not have 'What-If Counterfactuals' component for the notebook", () => {
        cy.get(Locators.CounterfactualHeader).should("not.exist");
      });
    }
    if (
      datasetShape.whatIfCounterfactualsData?.hasWhatIfCounterfactualsComponent
    ) {
      describeWhatIfCommonFunctionalities(datasetShape);
      describeAxisFlyouts(datasetShape);
      describeWhatIfCreate(datasetShape, name);
    }
  });
}
