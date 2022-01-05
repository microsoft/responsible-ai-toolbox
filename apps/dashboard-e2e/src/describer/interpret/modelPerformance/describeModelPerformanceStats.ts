// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IInterpretData } from "../IInterpretData";

export function describeModelPerformanceStats(dataShape: IInterpretData): void {
  describe("performance stats", () => {
    if (dataShape.noY) {
      it("should have missing stats", () => {
        cy.get("#MissingParameterPlaceHolder").contains(
          "Model performance statistics require the true outcomes be provided in addition to the predicted outcomes"
        );
      });
      return;
    }
    if (dataShape.isMulticlass) {
      it("should have legend", () => {
        cy.get('#OverallMetricChart g[class*="infolayer"]').should("exist");
      });
      return;
    }
    it("should have stats box", () => {
      cy.get('#OverallMetricChart div[class*="statsBox"]').should("exist");
    });
    it("should have some stats", () => {
      if (dataShape.isClassification) {
        cy.get('#OverallMetricChart div[class*="statsBox"]').contains(
          "Accuracy"
        );
        cy.get('#OverallMetricChart div[class*="statsBox"]').contains(
          "Precision"
        );
        cy.get('#OverallMetricChart div[class*="statsBox"]').contains(
          "Recall"
        );
        cy.get('#OverallMetricChart div[class*="statsBox"]').contains(
          "False Positive Rates"
        );
        cy.get('#OverallMetricChart div[class*="statsBox"]').contains(
          "False Negative Rates"
        );
      } else {
        cy.get('#OverallMetricChart div[class*="statsBox"]').contains("MSE");
        cy.get('#OverallMetricChart div[class*="statsBox"]').contains(
          "R-squared"
        );
        cy.get('#OverallMetricChart div[class*="statsBox"]').contains(
          "Mean prediction"
        );
      }
    });
  });
}
