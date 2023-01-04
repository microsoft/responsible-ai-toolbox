// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Locators } from "../Constants";
import { IModelAssessmentData } from "../IModelAssessmentData";

import { assertChartVisibility, getDefaultVisibleChart } from "./charts";

export function ensureAllModelOverviewDatasetCohortsViewBasicElementsArePresent(
  datasetShape: IModelAssessmentData,
  includeNewCohort: boolean,
  isNotebookTest: boolean
): void {
  const data = datasetShape.modelOverviewData;
  const initialCohorts = data?.initialCohorts;
  cy.get(Locators.ModelOverviewFeatureSelection).should("not.exist");
  cy.get(Locators.ModelOverviewFeatureConfigurationActionButton).should(
    "not.exist"
  );
  if (isNotebookTest) {
    const numberOfCohorts =
      (initialCohorts?.length || 0) + (includeNewCohort ? 1 : 0);
    if (numberOfCohorts <= 1) {
      cy.get(Locators.ModelOverviewHeatmapVisualDisplayToggle).should(
        "not.exist"
      );
    } else {
      cy.get(Locators.ModelOverviewHeatmapVisualDisplayToggle).should("exist");
    }
  }
  cy.get(Locators.ModelOverviewDatasetCohortStatsTable).should("exist");
  cy.get(Locators.ModelOverviewDisaggregatedAnalysisTable).should("not.exist");
  cy.get(Locators.ModelOverviewTableYAxisGrid).should(
    "include.text",
    initialCohorts?.[0].name
  );

  const metricsOrder: string[] = [];
  if (datasetShape.isRegression) {
    metricsOrder.push(
      "meanAbsoluteError",
      "meanSquaredError",
      "meanPrediction"
    );
  } else {
    metricsOrder.push("accuracy");
    if (!datasetShape.isMulticlass) {
      metricsOrder.push(
        "falsePositiveRate",
        "falseNegativeRate",
        "selectionRate"
      );
    }
  }

  const heatmapCellContents: string[] = [];
  const cohorts = initialCohorts?.concat(
    includeNewCohort && data?.newCohort ? [data.newCohort] : []
  );
  cohorts?.forEach((cohortData) => {
    heatmapCellContents.push(cohortData.sampleSize);
  });
  metricsOrder.forEach((metricName) => {
    cohorts?.forEach((cohortData) => {
      heatmapCellContents.push(cohortData.metrics[metricName]);
    });
  });

  if (isNotebookTest) {
    cy.get(Locators.ModelOverviewHeatmapCells)
      .should("have.length", (cohorts?.length || 0) * (metricsOrder.length + 1))
      .each(($cell) => {
        // somehow the cell string is one invisible character longer, trim
        expect($cell.text().slice(0, $cell.text().length - 1)).to.be.oneOf(
          heatmapCellContents
        );
      });
  }

  cy.get(
    Locators.ModelOverviewDisaggregatedAnalysisBaseCohortDisclaimer
  ).should("not.exist");
  cy.get(Locators.ModelOverviewDisaggregatedAnalysisBaseCohortWarning).should(
    "not.exist"
  );

  function ensureNotebookModelOverviewChartIsCorrect(): void {
    if (isNotebookTest) {
      cy.get(Locators.ModelOverviewMetricChartBars).should(
        "have.length",
        cohorts?.length
      );
      // check aria-label of bar chart - aria-label uses comma as delimiter
      // between digits for thousands instead of whitespace
      const displayedMetric =
        (datasetShape.isRegression
          ? initialCohorts?.[0].metrics.meanAbsoluteError
          : initialCohorts?.[0].metrics.accuracy) || "";
      const expectedAriaLabel =
        !datasetShape.isRegression && !datasetShape.isMulticlass
          ? `1. ${initialCohorts?.[0].name}, ${displayedMetric.replace(
              " ",
              ","
            )}.`
          : `${initialCohorts?.[0].name}, ${displayedMetric.replace(
              " ",
              ","
            )}. ${
              datasetShape.isRegression
                ? "Mean absolute error"
                : "Accuracy score"
            }.`;
      cy.get(Locators.ModelOverviewMetricChartBars)
        .first()
        .should("have.attr", "aria-label", expectedAriaLabel);
    }
  }

  assertChartVisibility(
    getDefaultVisibleChart(datasetShape.isRegression, datasetShape.isBinary),
    datasetShape.isRegression,
    datasetShape.isBinary
  );
  ensureNotebookModelOverviewChartIsCorrect();
}
