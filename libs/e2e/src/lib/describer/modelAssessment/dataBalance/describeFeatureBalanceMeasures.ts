// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Locators } from "../Constants";
import { IModelAssessmentData } from "../IModelAssessmentData";

export function describeFeatureBalanceMeasures(
  dataShape: IModelAssessmentData
): void {
  describe("Feature balance measures", () => {
    if (!dataShape.dataBalanceData?.featureBalanceMeasuresComputed) {
      it("Should not render feature balance measures", () => {
        cy.get(Locators.FeatureBalanceMeasures).should("not.exist");
      });
      return;
    }

    it("Should have a header with clickable info button", () => {
      cy.get(Locators.FeatureBalanceMeasuresHeader).contains(
        "Feature balance measures"
      );
      cy.get(`${Locators.FeatureBalanceMeasuresHeader} button`).should("exist");
    });

    it("Should have dropdowns for label, feature, and measure", () => {
      cy.get(Locators.FeatureBalanceMeasuresLabelDropdown).should("exist");
      cy.get(Locators.FeatureBalanceMeasuresFeatureDropdown).should("exist");
      cy.get(Locators.FeatureBalanceMeasuresMeasureDropdown).should("exist");
    });

    it("Should have a heatmap with x-axis, y-axis, and color axis", () => {
      cy.get(Locators.FeatureBalanceMeasuresHeatmap).should("exist");
      cy.get(Locators.FeatureBalanceMeasuresXAxis).should("exist");
      cy.get(Locators.FeatureBalanceMeasuresYAxis).should("exist");
      cy.get(Locators.FeatureBalanceMeasuresColorAxis).should("exist");
    });

    it("Should have proper x-axis and y-axis titles for heatmap", () => {
      cy.get(Locators.FeatureBalanceMeasuresXAxisTitle).contains("Class B");
      cy.get(Locators.FeatureBalanceMeasuresYAxisTitle).contains("Class A");
    });

    it("Should have non-zero and equal number of rows and columns in heatmap", () => {
      cy.get(Locators.FeatureBalanceMeasuresXAxis)
        .children()
        .should("have.length.above", 0);
      cy.get(Locators.FeatureBalanceMeasuresYAxis)
        .children()
        .should("have.length.above", 0);
      cy.get(Locators.FeatureBalanceMeasuresXAxis)
        .children()
        .should(
          "have.length",
          cy.$$(Locators.FeatureBalanceMeasuresYAxis).children().length
        );
    });
  });
}
