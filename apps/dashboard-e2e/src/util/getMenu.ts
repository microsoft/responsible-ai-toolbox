// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export function getMenu(
  text: string,
  container = ""
): Cypress.Chainable<JQuery<HTMLButtonElement>> {
  return cy.get(`${container} button:contains("${text}")`);
}
