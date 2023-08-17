// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { selectDropdown } from "../../../../util/dropdown";
import { Locators } from "../Constants";
import { IModelAssessmentData } from "../IModelAssessmentData";

export function describeWhatIfForecastingCreate(
  dataShape: IModelAssessmentData
): void {
  describe("What if Forecasting Create", () => {
    it("Should be able to select time series", () => {
      cy.get(Locators.ForecastingScenarioChart).should("not.exist");
      cy.get(Locators.ForecastingTimeSeriesDropdown).should("exist").click();
      cy.get(Locators.ForecastingTimeSeriesDropdownOptions).should(
        "have.length",
        dataShape.whatIfForecastingData?.numberOfTimeSeriesOptions
      );
      // click again to close dropdown ahead of selectDropdown
      cy.get(Locators.ForecastingTimeSeriesDropdown).click();
      if (dataShape.whatIfForecastingData?.timeSeriesToSelect) {
        selectDropdown(
          Locators.ForecastingTimeSeriesDropdown,
          dataShape.whatIfForecastingData?.timeSeriesToSelect
        );
      }

      cy.get(Locators.ForecastingScenarioChart).should("exist");
      cy.get(Locators.ForecastingScenarioChartCurves).should("have.length", 2);
    });
  });
}
