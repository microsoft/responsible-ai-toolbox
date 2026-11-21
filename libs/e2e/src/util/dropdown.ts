// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export function selectDropdown(selector: string, item: string | number): void {
  cy.get(`${selector}`).click();
  cy.contains("[role='option']", item.toString()).click({
    scrollBehavior: false
  });
}
