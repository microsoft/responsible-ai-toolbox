// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { createCohort } from "../../../../util/createCohort";
import { getMenu } from "../../../../util/getMenu";
import { Locators } from "../../Constants";

const cohortName = "CohortCreateE2E";
export function describeCohortFunctionality(): void {
  describe("Cohort functionality", () => {
    before(() => {
      getMenu("Aggregate feature importance").click();
    });
    it("Should have cohort selection in 'Sort by' dropdown", () => {
      createCohort();

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
