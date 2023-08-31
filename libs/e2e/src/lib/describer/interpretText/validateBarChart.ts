// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export function checkNumBars(locator: string, expectedNumBars: number): void {
  cy.get(`${locator} svg g.highcharts-series-group rect`).should(
    "have.length",
    expectedNumBars
  );
}

export function checkYAxisLabel(locator: string): void {
  cy.get(`${locator} .highcharts-axis-title`).should(
    "contain.text",
    "Feature importance"
  );
}

export function checkNumLabels(
  locator: string,
  expectedNumLabels: number
): void {
  cy.get(`${locator} g.highcharts-xaxis-labels text`)
    .its("length")
    .should("be", expectedNumLabels);
}

export function validateBarChart(
  locator: string,
  expectedNumValues: number
): void {
  checkNumBars(locator, expectedNumValues);
  checkYAxisLabel(locator);
  checkNumLabels(locator, expectedNumValues);
}
