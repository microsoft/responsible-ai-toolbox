// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Locators } from "../../Constants";

export function describeCohortFunctionality(): void {
  describe.only("Cohort functionality", () => {
    it("Should have cohort selection in 'Sort by' dropdown", () => {
      cy.get('button:contains("Create new cohort")').click();
      cy.get("#cohortEditPanel").should("exist");
      cy.get("#cohortEditPanel input:eq(0)").clear().type("CohortCreateE2E");
      cy.get('#cohortEditPanel [type="radio"]').first().check();
      cy.get('button:contains("Add filter")').click();
      cy.get("button:contains('Save and switch')").eq(0).click({ force: true });
      cy.get('span:contains("CohortCreateE2E")').should("exist");

      cy.get(Locators.SortByDropdown).click();
      cy.get(Locators.SortByDropdownOptions).should("exist");

      // //check on mouse over has 'All data'
      // cy.get(Locators.FirstBarInAggregateFeatureImportanceBarChart)
      //   .eq(0)
      //   .trigger("mouseenter", "top", { force: true });
      // // .trigger("mouseenter", { force: true });
      // cy.get(
      //   Locators.FirstBarInAggregateFeatureImportanceHoverAllDataText
      // ).should("contain", "All data");
    });

    it("Should disable cohort in on-off items on selection", () => {});
  });
}
