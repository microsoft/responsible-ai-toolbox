// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Locators } from "../Constants";
import { IModelAssessmentData } from "../IModelAssessmentData";
import { selectDropdown } from "libs/e2e/src/util/dropdown";

export function describeWhatIfForecastingCreateWhatIf(
  dataShape: IModelAssessmentData
): void {
  describe("What if Forecasting Create What If", () => {
    it("Should be able to create a what if scenario", () => {
      cy.get(Locators.ForecastingTransformationNameField).should("not.exist");
      cy.get(Locators.ForecastingTransformationCreationButton).should("exist").click();
      cy.get(Locators.ForecastingTransformationNameField).should("exist").type("test");

      cy.get(Locators.ForecastingTransformationFeatureDropdown).should("exist").click();
      cy.get(Locators.ForecastingTransformationFeatureDropdownOptions).should("have.length", dataShape.featureNames!.length);
      // click again to close dropdown ahead of selectComboBox
      cy.get(Locators.ForecastingTransformationFeatureDropdown).should("exist").click();
      selectDropdown(Locators.ForecastingTransformationFeatureDropdown, dataShape.whatIfForecastingData?.testTransformation?.featureToSelect!);

      //cy.get(Locators.ForecastingTransformationOperationDropdown).should("exist").click();
      cy.get(Locators.ForecastingTransformationOperationDropdownWrapper).should("exist").click();
      cy.get(Locators.ForecastingTransformationOperationDropdownOptions).should("have.length", 4);
      // click again to close dropdown ahead of selectComboBox
      cy.get(Locators.ForecastingTransformationOperationDropdownWrapper).should("exist").click();
      cy.get(`${Locators.ForecastingTransformationOperationDropdown} button.ms-ComboBox-CaretDown-button`)
        .click()
        .get(
          `div.ms-ComboBox-optionsContainerWrapper button:eq(${dataShape.whatIfForecastingData?.testTransformation?.operationToSelectIndex!})`
        )
        .click();

      cy.get(Locators.ForecastingTransformationValueField).should("exist").type(dataShape.whatIfForecastingData?.testTransformation?.valueToSelect!.toString()!);
      cy.get(Locators.ForecastingTransformationAddButton).should("exist").click();
      cy.get(Locators.ForecastingTransformationNameField).should("not.exist");
      
      cy.get(Locators.ForecastingTransformationsTable).should("exist");

      cy.get(Locators.ForecastingScenarioChart).should("exist");
      cy.get(Locators.ForecastingScenarioChartCurves).should("have.length", 3);
    });
  });
}
