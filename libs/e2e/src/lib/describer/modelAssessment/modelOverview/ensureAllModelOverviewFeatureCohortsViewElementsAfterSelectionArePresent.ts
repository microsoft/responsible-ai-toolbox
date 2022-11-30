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
  if (datasetShape.isMulticlass) {
    // 1 visible pivot item plus 1 hidden overflow button
    cy.get(Locators.ModelOverviewChartPivotItems).should("have.length", 2);
    cy.get(Locators.ModelOverviewProbabilityDistributionChart).should(
      "not.exist"
    );
    cy.get(Locators.ModelOverviewRegressionDistributionChart).should("not.exist");
    cy.get(Locators.ModelOverviewMetricChart).should("exist");
    const featureCohortView = datasetShape.modelOverviewData?.featureCohortView;
    let expectedNumberOfCohorts = featureCohortView?.singleFeatureCohorts;
    if (selectedFeatures > 1) {
      expectedNumberOfCohorts = featureCohortView?.multiFeatureCohorts;
    }
    cy.get(Locators.ModelOverviewMetricChartBars).should(
      "have.length",
      expectedNumberOfCohorts
    );
  } else if (datasetShape.isRegression) {
    // 2 visible pivot items plus 1 hidden overflow button
    cy.get(Locators.ModelOverviewChartPivotItems).should("have.length", 3);
    cy.get(Locators.ModelOverviewMetricChart).should("not.exist");
    cy.get(Locators.ModelOverviewProbabilityDistributionChart).should(
      "not.exist"
    );
    cy.get(Locators.ModelOverviewRegressionDistributionChart).should("exist");
  } else {
    // binary classification
    // 2 visible pivot items plus 1 hidden overflow button
    cy.get(Locators.ModelOverviewChartPivotItems).should("have.length", 3);
    cy.get(Locators.ModelOverviewProbabilityDistributionChart).should("exist");
    cy.get(Locators.ModelOverviewMetricChart).should("not.exist");
    cy.get(Locators.ModelOverviewRegressionDistributionChart).should(
      "not.exist"
    );
  }
}
