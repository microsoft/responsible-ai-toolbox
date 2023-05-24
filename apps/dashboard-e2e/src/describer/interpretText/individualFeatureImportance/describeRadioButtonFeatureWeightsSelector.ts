// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Locators } from "../../../util/Constants";
import { validateBarChart } from "../../../util/validateBarChart";

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

export function describeRadioButtonFeatureWeightsSelector(): void {
  describe("Radio button", () => {
    it("should be set to all features by default", () => {
      cy.get(`${Locators.TextChoiceGroup} [type='radio'][checked]`)
        .next()
        .should("have.class", "is-checked")
        .contains("ALL FEATURES");
      const notSpamExpectedNumValues = 5;
      validateTextBarChart(notSpamExpectedNumValues);
    });
    it("should be able to set radio button to all positive features", () => {
      const notSpamPositiveExpectedNumValues = 5;
      switchRadioButtonValidateSelection(
        1,
        "POSITIVE FEATURES",
        notSpamPositiveExpectedNumValues
      );
    });
    it("should be able to set radio button to all negative features", () => {
      const notSpamNegativeExpectedNumValues = 5;
      switchRadioButtonValidateSelection(
        2,
        "NEGATIVE FEATURES",
        notSpamNegativeExpectedNumValues
      );
    });
  });
}
