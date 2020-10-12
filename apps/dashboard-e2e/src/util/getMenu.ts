// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export function getMenu(
  text: string,
  container = ""
): ReturnType<Cypress.cy["get"]> {
  return cy.get(`${container} button:contains("${text}")`);
}
