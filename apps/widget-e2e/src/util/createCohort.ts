// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Locators } from "../describer/modelAssessment/Constants";

export function createCohort(): void {
  cy.get(Locators.CreateNewCohortButton).click();
  cy.get("#cohortEditPanel").should("exist");
  cy.get(Locators.CohortNameInput).clear().type("CohortCreateE2E");
  cy.get(Locators.CohortFilterSelection).eq(1).check(); // select Dataset
  cy.get(Locators.CohortAddFilterButton).click();
  cy.get(Locators.CohortSaveAndSwitchButton).eq(0).click({ force: true });
  cy.get(Locators.NewCohortSpan).should("exist");
}
