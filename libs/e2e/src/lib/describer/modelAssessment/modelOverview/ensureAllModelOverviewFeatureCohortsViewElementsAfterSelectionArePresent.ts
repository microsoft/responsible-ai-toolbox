// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Locators } from "../Constants";
import { IModelAssessmentData } from "../IModelAssessmentData";

import {
  assertChartVisibility,
  getChartItems,
  getDefaultVisibleChart
} from "./charts";
import { ensureHeatmapToggleBehavior } from "./ensureHeatmapToggleBehavior";

export function ensureAllModelOverviewFeatureCohortsViewElementsAfterSelectionArePresent(
  datasetShape: IModelAssessmentData,
  selectedFeatures: number,
  isTabular: boolean,
  isVision: boolean
): void {
  cy.get(Locators.ModelOverviewFeatureSelection).should("exist");
  cy.get(Locators.ModelOverviewFeatureConfigurationActionButton).should(
    "exist"
  );
  cy.get(Locators.ModelOverviewDatasetCohortStatsTable).should("not.exist");

  if (isTabular || isVision) {
    cy.get(Locators.ModelOverviewHeatmapVisualDisplayToggle).should("exist");
    cy.get(Locators.ModelOverviewDisaggregatedAnalysisTable).should("exist");

    ensureHeatmapToggleBehavior(
      Locators.ModelOverviewDisaggregatedAnalysisTable
    );

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
  if (Array.isArray(expectedNumberOfCohorts)) {
    cy.get(getChartItems(chartIdentifier))
      .its("length")
      .should("be.gte", expectedNumberOfCohorts[0])
      .and("be.lte", expectedNumberOfCohorts[1]);
  } else {
    cy.get(getChartItems(chartIdentifier)).should(
      "have.length",
      expectedNumberOfCohorts
    );
  }
}
