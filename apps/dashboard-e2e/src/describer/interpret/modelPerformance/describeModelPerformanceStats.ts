// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IInterpretData } from "../IInterpretData";

export function describeModelPerformanceStats(dataShape: IInterpretData): void {
  describe("performance stats", () => {
    if (dataShape.isMulticlass) {
      it("should have legend", () => {
        cy.get('#ModelPerformanceChart g[class*="infolayer"]').should("exist");
      });
    } else {
      it("should have stats box", () => {
        cy.get('#ModelPerformanceChart div[class*="statsBox"]').should("exist");
      });
      it("should have some stats", () => {
        if (dataShape.isClassification) {
          cy.get('#ModelPerformanceChart div[class*="statsBox"]').contains(
            "Accuracy"
          );
          cy.get('#ModelPerformanceChart div[class*="statsBox"]').contains(
            "Precision"
          );
          cy.get('#ModelPerformanceChart div[class*="statsBox"]').contains(
            "Recall"
          );
          cy.get('#ModelPerformanceChart div[class*="statsBox"]').contains(
            "FPR"
          );
          cy.get('#ModelPerformanceChart div[class*="statsBox"]').contains(
            "FNR"
          );
        } else {
          cy.get('#ModelPerformanceChart div[class*="statsBox"]').contains(
            "MSE"
          );
          cy.get('#ModelPerformanceChart div[class*="statsBox"]').contains(
            "R-squared"
          );
          cy.get('#ModelPerformanceChart div[class*="statsBox"]').contains(
            "Mean prediction"
          );
        }
      });
    }
  });
}
