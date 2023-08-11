// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Locators } from "../Constants";
import { IModelAssessmentData } from "../IModelAssessmentData";

import {
  assertChartVisibility,
  getChartItems,
  getDefaultVisibleChart
} from "./charts";

export function ensureAllModelOverviewFeatureCohortsViewElementsAfterSelectionArePresent(
  datasetShape: IModelAssessmentData,
  selectedFeatures: number
): void {
  cy.get(Locators.ModelOverviewFeatureSelection).should("exist");
  cy.get(Locators.ModelOverviewFeatureConfigurationActionButton).should(
    "exist"
  );
  cy.get(Locators.ModelOverviewDatasetCohortStatsTable).should("not.exist");

  if (!datasetShape.isObjectDetection) {
    cy.get(Locators.ModelOverviewHeatmapVisualDisplayToggle).should("exist");
    cy.get(Locators.ModelOverviewDisaggregatedAnalysisTable).should("exist");

    // checks the toggle is on
    cy.get(Locators.ModelOverviewHeatmapVisualDisplayToggle).should(
      "have.attr",
      "aria-checked",
      "true"
    );

    cy.get(Locators.ModelOverviewDisaggregatedAnalysisTable)
      .find("path")
      .should("have.attr", "fill")
      .and("include", "rgb");

    // turns off the toggle
    cy.get(Locators.ModelOverviewHeatmapVisualDisplayToggle).click();

    // checks the toggle is off
    cy.get(Locators.ModelOverviewHeatmapVisualDisplayToggle).should(
      "have.attr",
      "aria-checked",
      "false"
    );

    // checks there are no RGB colors in the heatmap table
    cy.get(Locators.ModelOverviewDisaggregatedAnalysisTable)
      .find("path")
      .should("not.have.attr", "fill", "rgb");

    const defaultVisibleChart = getDefaultVisibleChart(
      datasetShape.isRegression,
      datasetShape.isBinary
    );
    assertChartVisibility(datasetShape, defaultVisibleChart);

    assertNumberOfChartRowsEqual(
      datasetShape,
      selectedFeatures,
      defaultVisibleChart
    );
  } else {
    cy.get(Locators.ModelOverviewHeatmapVisualDisplayToggle).should(
      "not.exist"
    );
  }
}

function assertNumberOfChartRowsEqual(
  datasetShape: IModelAssessmentData,
  selectedFeatures: number,
  chartIdentifier: Locators
): void {
  const featureCohortView = datasetShape.modelOverviewData?.featureCohortView;
  let expectedNumberOfCohorts = featureCohortView?.singleFeatureCohorts;
  if (selectedFeatures > 1) {
    expectedNumberOfCohorts = featureCohortView?.multiFeatureCohorts;
  }
  console.log(selectedFeatures);
  console.log(expectedNumberOfCohorts);
  cy.get(getChartItems(chartIdentifier)).should(
    "have.length",
    expectedNumberOfCohorts
  );
}
