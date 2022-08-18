// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export function selectDropdown(
  selector: string,
  item: string | number
): Cypress.Chainable<JQuery<HTMLElement>> {
  cy.get(selector).eq(0).click();
  return cy
    .get(".ms-Callout")
    .should("be.visible")
    .get(".ms-Dropdown-optionText")
    .contains(item)
    .click();
}

export function getDropdownValue(selector: string): string | undefined {
  return cy.$$(`${selector} .ms-Dropdown-title`).text();
}
