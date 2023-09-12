// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Locators } from "../Constants";
import { IInterpretTextData } from "../IInterpretTextData";
import { validateBarChart } from "../validateBarChart";

function validateTextBarChart(expectedNumValues: number): void {
  validateBarChart(Locators.TextExplanationChart, expectedNumValues);
}

function switchRadioButtonValidateSelection(
  selectedIndex: number,
  expectedOptionValue: string,
  expectedNumValues: number
): void {
  cy.get(`${Locators.TextChoiceGroup} .ms-ChoiceField-input`)
    .eq(selectedIndex)
    .check({ force: true })
    .then(() => {
      cy.get(`${Locators.TextChoiceGroup} .is-checked`).contains(
        expectedOptionValue
      );
      validateTextBarChart(expectedNumValues);
    });
}

export function describeRadioButtonFeatureWeightsSelector(
  dataShape: IInterpretTextData
): void {
  describe("Radio button", () => {
    it("should be set to all features by default", () => {
      cy.get(`${Locators.TextChoiceGroup} [type='radio'][checked]`)
        .next()
        .should("have.class", "is-checked")
        .contains("ALL FEATURES");
      const expectedNumValues =
        dataShape.expectedFeaturesValues?.allFeaturesExpectedValues ?? 5;
      validateTextBarChart(expectedNumValues);
    });
    it("should be able to set radio button to all positive features", () => {
      const positiveExpectedNumValues =
        dataShape.expectedFeaturesValues?.positiveFeaturesExpectedValues ?? 5;
      switchRadioButtonValidateSelection(
        1,
        "POSITIVE FEATURES",
        positiveExpectedNumValues
      );
    });
    it("should be able to set radio button to all negative features", () => {
      const negativeExpectedNumValues =
        dataShape.expectedFeaturesValues?.negativeFeaturesExpectedValues ?? 5;
      switchRadioButtonValidateSelection(
        2,
        "NEGATIVE FEATURES",
        negativeExpectedNumValues
      );
    });
  });
}
