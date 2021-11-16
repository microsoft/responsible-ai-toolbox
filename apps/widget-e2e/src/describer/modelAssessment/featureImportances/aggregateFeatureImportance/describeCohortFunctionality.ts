// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Locators } from "../../Constants";

export function describeCohortFunctionality(): void {
  describe.only("Cohort functionality", () => {
    it("Should be able to select created cohort", () => {
      cy.get('button:contains("Create new cohort")').click();
      cy.get("#cohortEditPanel").should("exist");
      cy.get("#cohortEditPanel input:eq(0)").clear().type("CohortCreateE2E");
      cy.get('#cohortEditPanel [type="radio"]').first().check();
      cy.get('button:contains("Add filter")').click();
      cy.get("button:contains('Save and switch')").eq(0).click({ force: true });
      cy.get('span:contains("CohortCreateE2E")').should("exist");

      //check on mouse over has 'All data'
      cy.get(Locators.FirstBarInAggregateFeatureImportanceBarChart)
        .eq(0)
        .trigger("mouseenter", { force: true });
      cy.get(Locators.FirstBarInAggregateFeatureImportanceHoverAllDataText)
        .eq(2)
        .should("contain", "All data");
    });
  });
}
