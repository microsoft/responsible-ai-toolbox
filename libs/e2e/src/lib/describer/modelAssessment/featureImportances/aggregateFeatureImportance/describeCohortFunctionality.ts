// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { createCohort } from "../../../../../util/createCohort";
import { getMenu } from "../../../../../util/getMenu";
import { Locators } from "../../Constants";

export function describeCohortFunctionality(): void {
  describe("Cohort functionality", () => {
    before(() => {
      getMenu("Aggregate feature importance").click();
    });
    it("Should have cohort selection in 'Sort by' dropdown", () => {
      createCohort();

      cy.get(Locators.SortByDropdown).eq(0).click(); // Dropdown to select cohort
      cy.get(Locators.SortByDropdownOptions).should("exist");
    });
  });
}
