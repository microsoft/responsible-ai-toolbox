// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { getSpan } from "../../../util/getSpan";
import {
  sensitiveFeaturesTab,
  performanceMetricsTab,
  fairnessMetricsTab
} from "../constants";

export function checkSensitiveFeatureSelectionPage(): void {
  cy.get(`button:contains("${sensitiveFeaturesTab}")`).should(
    "have.class",
    "is-selected"
  );
  cy.get(`button:contains("${performanceMetricsTab}")`).should("exist");
  cy.get(`button:contains("${fairnessMetricsTab}")`).should("exist");
  getSpan(
    "Along which features would you like to evaluate your model's fairness?"
  ).should("exist");
  getSpan("Sensitive features").should("exist");
  getSpan("Sensitive feature 0").should("exist");
  getSpan("Sensitive feature 1").should("exist");
}

export function checkPerformanceMetricSelectionPage(): void {
  cy.get(`button:contains("${sensitiveFeaturesTab}")`).should("exist");
  cy.get(`button:contains("${performanceMetricsTab}")`).should(
    "have.class",
    "is-selected"
  );
  cy.get(`button:contains("${fairnessMetricsTab}")`).should("exist");
  getSpan("How do you want to measure performance?").should("exist");
  getSpan("Accuracy").should("exist");
}

export function checkFairnessMetricSelectionPage(): void {
  cy.get(`button:contains("${sensitiveFeaturesTab}")`).should("exist");
  cy.get(`button:contains("${performanceMetricsTab}")`).should("exist");
  cy.get(`button:contains("${fairnessMetricsTab}")`).should(
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
