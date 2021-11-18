// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Locators } from "../../Constants";

const cohortName = "CohortCreateE2E";
export function describeCohortFunctionality(): void {
  describe("Cohort functionality", () => {
    it("Should have cohort selection in 'Sort by' dropdown", () => {
      cy.get(Locators.CreateNewCohortButton).click();
      cy.get("#cohortEditPanel").should("exist");
      cy.get(Locators.CohortNameInput).clear().type(cohortName);
      cy.get(Locators.CohortFilterSelection).first().check();
      cy.get(Locators.CohortAddFilterButton).click();
      cy.get(Locators.CohortSaveAndSwitchButton).eq(0).click({ force: true });
      cy.get(Locators.NewCohortSpan).should("exist");

      cy.get(Locators.SortByDropdown).click();
      cy.get(Locators.SortByDropdownOptions).should("exist");
    });

    it("Should disable cohort in on-off items on selection", () => {
      cy.get(Locators.CohortOnOffSelectionContainer).should(
        "contain",
        cohortName
      );
      cy.get(Locators.CohortOnOffCohortCreateE2E).should(
        "have.attr",
        "aria-checked",
        "true"
      );
      cy.get(Locators.CohortOnOffCohortCreateE2E).click({ force: true });
      cy.get(Locators.CohortOnOffCohortCreateE2E).should(
        "have.attr",
        "aria-checked",
        "false"
      );
    });
  });
}
