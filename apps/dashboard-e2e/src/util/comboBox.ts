// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

function getItemSelector(item: string | number): string {
  if (typeof item === "string") {
    return `:contains("${item}")`;
  }
  return `:eq(${item})`;
}

export function selectComboBox(
  selector: string,
  item: string | number
): Cypress.Chainable<JQuery<HTMLElement>> {
  return cy
    .get(`${selector} button.ms-ComboBox-CaretDown-button`)
    .click()
    .get(
      `${selector} div.ms-ComboBox-optionsContainerWrapper button${getItemSelector(
        item
      )}`
    )
    .click();
}

export function getComboBoxValue(selector: string): string | undefined {
  return cy.$$(`${selector} input.ms-ComboBox-Input`).val()?.toString();
}
