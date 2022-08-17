// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { getSpan } from "./getSpan";

export function selectDropdown(selector: string, item: string | number): void {
  cy.get(`${selector}`).click();
  getSpan(item.toString()).click();
}

export function selectDropdownWithKeys(
  selector: string
): Cypress.Chainable<JQuery<HTMLElement>> {
  return cy.get(`${selector} .ms-Dropdown-title`).type("{downarrow}{enter}");
}

export function getDropdownValue(selector: string): string | undefined {
  return cy.$$(`${selector} .ms-Dropdown-title`).text();
}
