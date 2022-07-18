// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Locators } from "../Constants";
import { IModelAssessmentData } from "../IModelAssessmentData";

export function describeDistributionBalanceMeasures(
  dataShape: IModelAssessmentData
): void {
  describe("Distribution balance measures", () => {
    if (!dataShape.dataBalanceData?.distributionBalanceMeasuresComputed) {
      it("Should not render distribution balance measures", () => {
        cy.get(Locators.DistributionBalanceMeasures).should("not.exist");
      });
      return;
    }

    it("Should have a header with clickable info button", () => {
      cy.get(Locators.DistributionBalanceMeasuresHeader).contains(
        "Distribution balance measures"
      );
      cy.get(`${Locators.DistributionBalanceMeasuresHeader} button`).should(
        "exist"
      );
    });

    it("Should have a legend consisting of 8 measures, 4 of which are hidden", () => {
      cy.get(Locators.DistributionBalanceMeasuresLegendItems).should(
        "have.length",
        8
      );
      cy.get(Locators.DistributionBalanceMeasuresLegendHiddenItems).should(
        "have.length",
        4
      );
    });

    it("Should have 8 subplots, each having a title for the measure", () => {
      cy.get(Locators.DistributionBalanceMeasuresXAxes).should(
        "have.length",
        8
      );
      cy.get(Locators.DistributionBalanceMeasuresXAxes).should(
        "have.length",
        8
      );
      cy.get(Locators.DistributionBalanceMeasuresAxisTitles).each(($title) => {
        expect($title.text()).to.have.length.above(0);
      });
    });
  });
}
