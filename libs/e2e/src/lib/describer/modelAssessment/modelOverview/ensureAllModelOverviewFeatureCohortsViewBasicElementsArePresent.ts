// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Locators } from "../Constants";

export function ensureAllModelOverviewFeatureCohortsViewBasicElementsArePresent(
  isNotebookTest: boolean
): void {
  cy.get(Locators.ModelOverviewFeatureSelection).should("exist");
  cy.get(Locators.ModelOverviewFeatureConfigurationActionButton).should(
    "exist"
  );
  cy.get(Locators.ModelOverviewHeatmapVisualDisplayToggle).should("not.exist");
  cy.get(Locators.ModelOverviewDatasetCohortStatsTable).should("not.exist");
  cy.get(Locators.ModelOverviewDisaggregatedAnalysisTable).should("not.exist");
  //cy.get(Locators.ModelOverviewTableYAxisGrid).should("not.exit");
  cy.get(Locators.ModelOverviewHeatmapCells).should("not.exist");
  cy.get(
    Locators.ModelOverviewDisaggregatedAnalysisBaseCohortDisclaimer
  ).should("not.exist");
  cy.get(Locators.ModelOverviewDisaggregatedAnalysisBaseCohortWarning).should(
    "not.exist"
  );
  cy.get(Locators.ModelOverviewChartPivot).should("not.exist");
  cy.get(Locators.ModelOverviewProbabilityDistributionChart).should(
    "not.exist"
  );
  cy.get(Locators.ModelOverviewMetricChart).should("not.exist");
  if (isNotebookTest) {
    cy.get(Locators.MissingParameterPlaceholder).should(
      "include.text",
      "Select features to generate the feature-based analysis."
    );
  }
}
