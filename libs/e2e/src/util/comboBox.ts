// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

function getItemSelector(item: string | number): string {
  if (typeof item === "string") {
    return `:contains("${item}")`;
  }
  return `:eq(${item})`;
}
export function selectComboBox(selector: string, item: string | number): void {
  cy.get(`${selector} button.ms-ComboBox-CaretDown-button`)
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

export function multiSelectComboBox(
  selector: string,
  item: string | number,
  firstSelect?: boolean
): void {
  cy.get(`${selector} button.ms-ComboBox-CaretDown-button`)
    .then(($option) => {
      // for some reason even the cy.get call above is enough to open the dropdown upon the second selection
      if (firstSelect) {
        cy.wrap($option).click();
      }
    })
    .get(
      `div.ms-ComboBox-optionsContainerWrapper .ms-Checkbox${getItemSelector(
        item
      )}`
    )
    .click();
}
