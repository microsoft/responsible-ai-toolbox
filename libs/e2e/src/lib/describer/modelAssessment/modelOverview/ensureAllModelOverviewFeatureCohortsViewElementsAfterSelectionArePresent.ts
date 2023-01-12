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
  cy.get(Locators.ModelOverviewHeatmapVisualDisplayToggle).should("exist");
  cy.get(Locators.ModelOverviewDatasetCohortStatsTable).should("not.exist");
  cy.get(Locators.ModelOverviewDisaggregatedAnalysisTable).should("exist");

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
