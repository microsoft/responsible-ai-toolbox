// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export function getSpan(text: string): ReturnType<Cypress.cy["get"]> {
  return cy.get("span").contains(text);
}
