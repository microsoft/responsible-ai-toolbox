// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { visit } from "../../../../util/visit";
import { Locators } from "../Constants";
import { modelAssessmentDatasets } from "../datasets/modelAssessmentDatasets";
import { IModelAssessmentData } from "../IModelAssessmentData";

import { describeWhatIfForecastingCreate } from "./describeWhatIfForecastingCreate";
import { describeWhatIfForecastingCreateWhatIf } from "./describeWhatIfForecastingCreateWhatIf";

const testName = "What If Forecasting";

export function describeWhatIfForecasting(
  datasetShape: IModelAssessmentData,
  name?: keyof typeof modelAssessmentDatasets
): void {
  describe(testName, () => {
    before(() => {
      visit(name);
      cy.get("#ModelAssessmentDashboard").should("exist");
    });
    if (!datasetShape.whatIfForecastingData?.hasWhatIfForecastingComponent) {
      it("should not have 'What-If Forecasting' component for the notebook", () => {
        cy.get(Locators.ForecastingDashboard).should("not.exist");
      });
    } else {
      describeWhatIfForecastingCreate(datasetShape);
      describeWhatIfForecastingCreateWhatIf(datasetShape);
    }
  });
}
