// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Locators } from "../Constants";
import { IModelAssessmentData } from "../IModelAssessmentData";

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
  cy.get(Locators.ModelOverviewChartPivot).should("exist");

  function assertNumberOfChartRowsEqual(chartIdentifier: Locators) {
    const featureCohortView = datasetShape.modelOverviewData?.featureCohortView;
    let expectedNumberOfCohorts = featureCohortView?.singleFeatureCohorts;
    if (selectedFeatures > 1) {
      expectedNumberOfCohorts = featureCohortView?.multiFeatureCohorts;
    }
    cy.get(chartIdentifier).should("have.length", expectedNumberOfCohorts);
  }

  if (datasetShape.isRegression) {
    cy.get(Locators.ModelOverviewChartPivotItems).should("have.length", 3);
    cy.get(Locators.ModelOverviewProbabilityDistributionChart).should(
      "not.exist"
    );
    cy.get(Locators.ModelOverviewRegressionDistributionChart).should("exist");
    cy.get(Locators.ModelOverviewMetricChart).should("not.exist");
    assertNumberOfChartRowsEqual(Locators.ModelOverviewRegressionDistributionChartBoxes);
  } else if (datasetShape.isMulticlass) {
    cy.get(Locators.ModelOverviewChartPivotItems).should("have.length", 3);
    cy.get(Locators.ModelOverviewProbabilityDistributionChart).should(
      "not.exist"
    );
    cy.get(Locators.ModelOverviewMetricChart).should("exist");
    cy.get(Locators.ModelOverviewConfusionMatrix).should("not.exist");
    assertNumberOfChartRowsEqual(Locators.ModelOverviewMetricChartBars);
  } else if (datasetShape.isBinary) {
    cy.get(Locators.ModelOverviewChartPivotItems).should("have.length", 4);
    cy.get(Locators.ModelOverviewProbabilityDistributionChart).should("exist");
    cy.get(Locators.ModelOverviewMetricChart).should("not.exist");
    cy.get(Locators.ModelOverviewConfusionMatrix).should("not.exist");
    cy.get(Locators.ModelOverviewRegressionDistributionChart).should(
      "not.exist"
    );
    assertNumberOfChartRowsEqual(Locators.ModelOverviewProbabilityDistributionChartBoxes);
  } else {
    throw new Error(
      "Task should be one of regression, multiclass, or binary classification."
    );
  }
}
