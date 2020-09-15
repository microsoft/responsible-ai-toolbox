// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export function getSpan(
  text: string
): Cypress.Chainable<JQuery<HTMLSpanElement>> {
  return cy.get("span").contains(text);
}
