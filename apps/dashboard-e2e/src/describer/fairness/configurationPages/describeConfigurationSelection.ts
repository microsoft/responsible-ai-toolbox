// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { getSpan } from "apps/dashboard-e2e/src/util/getSpan";

export function checkSensitiveFeatureSelectionPage(): void {
  cy.get('button:contains("01 Sensitive features")').should(
    "have.class",
    "is-selected"
  );
  cy.get('button:contains("02 Performance metrics")').should("exist");
  cy.get('button:contains("03 Fairness metrics")').should("exist");
  getSpan(
    "Along which features would you like to evaluate your model's fairness?"
  ).should("exist");
}

export function checkPerformanceMetricSelectionPage(): void {
  cy.get('button:contains("01 Sensitive features")').should("exist");
  cy.get('button:contains("02 Performance metrics")').should(
    "have.class",
    "is-selected"
  );
  cy.get('button:contains("03 Fairness metrics")').should("exist");
  getSpan("How do you want to measure performance?").should("exist");
}

export function checkFairnessMetricSelectionPage(): void {
  cy.get('button:contains("01 Sensitive features")').should("exist");
  cy.get('button:contains("02 Performance metrics")').should("exist");
  cy.get('button:contains("03 Fairness metrics")').should(
    "have.class",
    "is-selected"
  );
  getSpan("How do you want to measure fairness?").should("exist");
}

export function describeConfigurationPages(): void {
  describe("configuration pages", () => {
    it("should navigate through configuration pages", () => {
      // move to the first configuration page
      getSpan("Get started").click();

      checkSensitiveFeatureSelectionPage();
      cy.get('button:contains("Next")').click();
      checkPerformanceMetricSelectionPage();
      cy.get('button:contains("Next")').click();
      checkFairnessMetricSelectionPage();
      cy.get('button:contains("Next")').click();
      getSpan("Model comparison").should("exist");
    });
  });
}
