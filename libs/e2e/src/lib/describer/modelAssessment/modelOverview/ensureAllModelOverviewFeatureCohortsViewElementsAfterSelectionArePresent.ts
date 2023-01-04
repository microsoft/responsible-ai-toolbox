// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Locators } from "../Constants";
import { IModelAssessmentData } from "../IModelAssessmentData";

import { assertChartVisibility, getDefaultVisibleChart } from "./charts";

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

  assertChartVisibility(
    getDefaultVisibleChart(datasetShape.isRegression, datasetShape.isBinary),
    datasetShape.isRegression,
    datasetShape.isBinary
  );

  if (datasetShape.isRegression) {
    assertNumberOfChartRowsEqual(
      datasetShape,
      selectedFeatures,
      Locators.ModelOverviewRegressionDistributionChartBoxes
    );
  } else if (datasetShape.isMulticlass) {
    assertNumberOfChartRowsEqual(
      datasetShape,
      selectedFeatures,
      Locators.ModelOverviewMetricChartBars
    );
  } else if (datasetShape.isBinary) {
    assertNumberOfChartRowsEqual(
      datasetShape,
      selectedFeatures,
      Locators.ModelOverviewProbabilityDistributionChartBoxes
    );
  } else {
    throw new Error(
      "Task should be one of regression, multiclass, or binary classification."
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
  cy.get(chartIdentifier).should("have.length", expectedNumberOfCohorts);
}
