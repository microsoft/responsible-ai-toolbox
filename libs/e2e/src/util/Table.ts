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
  ).should("exist");
  return Cypress.$(
    `${selectorPrefix} [data-automationid=DetailsList] [data-automationid=ListCell]`
  ).length;
}

export function assertRowSelected(
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
        .should("have.attr", "aria-selected")
        .and("contain", "true");
    });
}

export function getTableColumnsValues(
  columnNames: string[],
  srPrefix?: string
): string[][] {
  const selectorPrefix = srPrefix ? `${srPrefix}` : "";
  const columnValuesToSkipLocalization: string[][] = [];
  columnNames.forEach((columnName) => {
    columnValuesToSkipLocalization.push(
      getTableColumnValues(columnName, selectorPrefix)
    );
  });
  return columnValuesToSkipLocalization;
}

export function getTableColumnValues(
  columnName: string,
  srPrefix: string
): string[] {
  const columnValues: string[] = [];
  Cypress.$(`${srPrefix}  [data-automationid="ColumnsHeaderColumn"]`).each(
    (columnIndex, columnValue) => {
      if (
        columnValue.textContent &&
        columnValue.textContent.includes(columnName)
      ) {
        Cypress.$(
          `${srPrefix} [data-automationid="ListCell"] [aria-colindex="${
            columnIndex + 1
          }"]`
        ).each((_colIndex, colValue) => {
          if (colValue.textContent) {
            columnValues.push(colValue.textContent);
          }
        });
      }
    }
  );
  return columnValues;
}
