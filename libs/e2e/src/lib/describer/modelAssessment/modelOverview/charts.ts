// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Locators } from "../Constants";

export const allCharts = [
  Locators.ModelOverviewRegressionDistributionChart,
  Locators.ModelOverviewProbabilityDistributionChart,
  Locators.ModelOverviewConfusionMatrix,
  Locators.ModelOverviewMetricChart
];

// The order in each list matters and should reflect the order in the pivot.
export const modelOverviewCharts = {
  binary: [
    Locators.ModelOverviewProbabilityDistributionChart,
    Locators.ModelOverviewMetricChart,
    Locators.ModelOverviewConfusionMatrix
  ],
  multiclass: [
    Locators.ModelOverviewMetricChart,
    Locators.ModelOverviewConfusionMatrix
  ],
  regression: [
    Locators.ModelOverviewRegressionDistributionChart,
    Locators.ModelOverviewMetricChart
  ]
};

export function getAvailableCharts(
  isRegression?: boolean,
  isBinary?: boolean
): string[] {
  if (isRegression) {
    return modelOverviewCharts.regression;
  }
  if (isBinary) {
    return modelOverviewCharts.binary;
  }
  return modelOverviewCharts.multiclass;
}

export function assertChartVisibility(
  expectedVisibleChart?: string,
  isRegression?: boolean,
  isBinary?: boolean
): void {
  const charts = getAvailableCharts(isRegression, isBinary);
  if (expectedVisibleChart) {
    cy.get(Locators.ModelOverviewChartPivot).should("exist");
    // With n pivot items the total length is n+1 due to a hidden overflow button.
    cy.get(Locators.ModelOverviewChartPivotItems).should(
      "have.length",
      charts.length + 1
    );
  } else {
    // no charts should be visible
    cy.get(Locators.ModelOverviewChartPivot).should("not.exist");
    cy.get(Locators.ModelOverviewChartPivotItems).should("not.exist");
  }
  allCharts.forEach((chartName) => {
    if (
      charts.includes(chartName) &&
      expectedVisibleChart &&
      expectedVisibleChart === chartName
    ) {
      cy.get(chartName).should("exist");
    } else {
      cy.get(chartName).should("not.exist");
    }
  });
}

export function getDefaultVisibleChart(
  isRegression?: boolean,
  isBinary?: boolean
): string {
  if (isRegression) {
    return Locators.ModelOverviewRegressionDistributionChart;
  } else if (isBinary) {
    return Locators.ModelOverviewProbabilityDistributionChart;
  }
  // multiclass classification
  return Locators.ModelOverviewMetricChart;
}
