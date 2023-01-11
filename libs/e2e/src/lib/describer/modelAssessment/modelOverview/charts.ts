// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Locators } from "../Constants";
import { IModelAssessmentData } from "../IModelAssessmentData";

import { getNumberOfCohorts } from "./numberOfCohorts";

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

export function getChartItems(chartName: Locators): Locators {
  // return the locators of the items (bars, boxes, etc.)
  switch (chartName) {
    case Locators.ModelOverviewMetricChart:
      return Locators.ModelOverviewMetricChartBars;
    case Locators.ModelOverviewProbabilityDistributionChart:
      return Locators.ModelOverviewProbabilityDistributionChartBoxes;
    case Locators.ModelOverviewRegressionDistributionChart:
      return Locators.ModelOverviewRegressionDistributionChartBoxes;
    default:
      throw new Error(
        `Chart type ${chartName.toString()} not supported by getChartItems.`
      );
  }
}

export function getAvailableCharts(
  isRegression?: boolean,
  isBinary?: boolean
): Locators[] {
  if (isRegression) {
    return modelOverviewCharts.regression;
  }
  if (isBinary) {
    return modelOverviewCharts.binary;
  }
  return modelOverviewCharts.multiclass;
}

export function assertChartVisibility(
  datasetShape: IModelAssessmentData,
  expectedVisibleChart?: string
): void {
  const isRegression = datasetShape.isRegression;
  const isBinary = datasetShape.isBinary;
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
): Locators {
  if (isRegression) {
    return Locators.ModelOverviewRegressionDistributionChart;
  } else if (isBinary) {
    return Locators.ModelOverviewProbabilityDistributionChart;
  }
  // multiclass classification
  return Locators.ModelOverviewMetricChart;
}

export function ensureNotebookModelOverviewMetricChartIsCorrect(
  isNotebookTest: boolean,
  datasetShape: IModelAssessmentData,
  includeNewCohort: boolean
): void {
  if (isNotebookTest) {
    cy.get(Locators.ModelOverviewMetricChartBars).should(
      "have.length",
      getNumberOfCohorts(datasetShape, includeNewCohort)
    );
    const initialCohorts = datasetShape.modelOverviewData?.initialCohorts;
    // check aria-label of bar chart - aria-label uses comma as delimiter
    // between digits for thousands instead of whitespace
    const displayedMetric =
      (datasetShape.isRegression
        ? initialCohorts?.[0].metrics.meanAbsoluteError
        : initialCohorts?.[0].metrics.accuracy) || "";
    const expectedAriaLabel = `${
      initialCohorts?.[0].name
    }, ${displayedMetric.replace(" ", ",")}. ${
      datasetShape.isRegression ? "Mean absolute error" : "Accuracy score"
    }.`;
    cy.get(Locators.ModelOverviewMetricChartBars)
      .first()
      .should("have.attr", "aria-label", expectedAriaLabel);
  }
}

export function ensureChartsPivot(
  datasetShape: IModelAssessmentData,
  isNotebookTest: boolean,
  includeNewCohort: boolean
): void {
  cy.get(Locators.ModelOverviewCohortViewDatasetCohortViewButton).click();
  const availableCharts = getAvailableCharts(
    datasetShape.isRegression,
    datasetShape.isBinary
  );
  cy.get(Locators.ModelOverviewChartPivotItems).as("chartPivotItems");
  availableCharts.forEach((chartName, index) => {
    cy.get("@chartPivotItems").then(($pivotItems) => {
      $pivotItems[index].click();
    });
    assertChartVisibility(datasetShape, chartName);

    if (chartName === Locators.ModelOverviewMetricChart) {
      ensureNotebookModelOverviewMetricChartIsCorrect(
        isNotebookTest,
        datasetShape,
        includeNewCohort
      );
    }
  });
}
