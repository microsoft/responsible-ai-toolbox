// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Locators } from "../lib/describer/modelAssessment/Constants";

import { generateId } from "./generateId";

export function createCohort(name?: string): void {
  const cohortName = name ?? `CohortCreateE2E-${generateId(4)}`;
  cy.get(Locators.CreateNewCohortButton).click();
  cy.get("#cohortEditPanel").should("exist");
  cy.get(Locators.CohortNameInput).clear().type(cohortName);
  cy.get(Locators.CohortFilterSelection).eq(1).check(); // select Dataset
  cy.get(Locators.CohortAddFilterButton).click();
  cy.get(Locators.CohortSaveAndSwitchButton).eq(0).click({ force: true });
  cy.get(Locators.NewCohortSpan).should("exist");
}
