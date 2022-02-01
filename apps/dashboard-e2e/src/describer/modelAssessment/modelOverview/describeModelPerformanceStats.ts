// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IModelAssessmentData } from "../IModelAssessmentData";

export function describeModelPerformanceStats(
  modelAssessmentData: IModelAssessmentData
): void {
  describe("performance stats", () => {
    it("should have legend", () => {
      cy.get('#OverallMetricChart g[class*="infolayer"]').should("exist");
    });
    // stats box currently not available for multiclass
    if (!modelAssessmentData.isMulticlass) {
      it("should have stats box", () => {
        cy.get('#OverallMetricChart div[class*="statsBox"]').should("exist");
      });
      it("should have some stats", () => {
        if (modelAssessmentData.isClassification) {
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
    }
  });
}
