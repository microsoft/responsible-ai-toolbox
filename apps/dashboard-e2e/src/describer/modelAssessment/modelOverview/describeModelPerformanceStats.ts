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
        let expectedMetrics: string[];
        if (modelAssessmentData.isClassification) {
          expectedMetrics = [
            "Accuracy",
            "Precision",
            "F1 score",
            "False positive rate",
            "False negative rate",
            "Selection rate"
          ];
        } else {
          expectedMetrics = [
            "Mean squared error",
            "Mean absolute error",
            "R²",
            "Mean prediction"
          ];
        }
        expectedMetrics.forEach((metricName) => {
          cy.get('#OverallMetricChart div[class*="statsBox"]').contains(
            metricName
          );
        });
      });
    }
  });
}
