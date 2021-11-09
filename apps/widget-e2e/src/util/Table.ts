// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export function selectRow(
  columnName: string,
  columnValue: string,
  srPrefix?: string
): void {
  const selectorPrefix = srPrefix ? `${srPrefix}` : "";
  const columnsHeaderColumn = `${selectorPrefix} [data-automationid='ColumnsHeaderColumn']`;
  cy.get(columnsHeaderColumn)
    .contains(columnName)
    .parents(columnsHeaderColumn)
    .invoke("attr", "data-item-key")
    .then((columnIndex) => {
      cy.get(`${selectorPrefix} [data-automation-key='${columnIndex}']`)
        .contains(columnValue)
        .parents(`${selectorPrefix} div[data-automationid='DetailsRow']`)
        .click({ force: true });
    });
}

export function getTableRowCount(srPrefix?: string): number {
  const selectorPrefix = srPrefix ? `${srPrefix}` : "";
  cy.get(
    `${selectorPrefix} [data-automationid=DetailsList] [data-automationid=ListCell]`
  ).should("exist"); // [data-automationid='DetailsList']
  return Cypress.$(
    `${selectorPrefix} [data-automationid=DetailsList] [data-automationid=ListCell]`
  ).length;
}
