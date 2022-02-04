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
      let expectedMetrics: string[];
      if (dataShape.isClassification) {
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
  });
}
