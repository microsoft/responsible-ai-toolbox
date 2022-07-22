// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Locators } from "../Constants";
import { IModelAssessmentData } from "../IModelAssessmentData";

export function describeDistributionBalanceMeasures(
  dataShape: IModelAssessmentData
): void {
  describe("Distribution balance measures", () => {
    if (!dataShape.dataBalanceData?.distributionBalanceMeasuresComputed) {
      it("should render no measures computed message", () => {
        cy.get(
          `${Locators.DistributionBalanceMeasures} #MissingParameterPlaceHolder`
        ).contains(
          "Distribution balance measures were not computed. To compute them, please ensure that: (1) the task type is 'classification', (2) the list of categorical features is valid and non-empty, and (3) no errors are thrown when computing insights."
        );
      });
      return;
    }

    it("should have a header with clickable info button", () => {
      cy.get(Locators.DistributionBalanceMeasuresHeader).contains(
        "Distribution balance measures"
      );
      cy.get(`${Locators.DistributionBalanceMeasuresHeader} button`).should(
        "exist"
      );
    });

    it("should have a legend consisting of 8 measures, 4 of which are hidden", () => {
      cy.get(Locators.DistributionBalanceMeasuresLegendItems).should(
        "have.length",
        8
      );
      cy.get(Locators.DistributionBalanceMeasuresLegendHiddenItems).should(
        "have.length",
        4
      );
    });

    it("should have 8 subplots, each having a title for the measure", () => {
      cy.get(Locators.DistributionBalanceMeasuresXAxes).should(
        "have.length",
        8
      );
      cy.get(Locators.DistributionBalanceMeasuresYAxes).should(
        "have.length",
        8
      );
      cy.get(Locators.DistributionBalanceMeasuresAxisTitles).each(($title) => {
        expect($title.text()).to.have.length.above(0);
      });
    });
  });
}
