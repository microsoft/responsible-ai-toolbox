// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Locators } from "../Constants";
import { IModelAssessmentData } from "../IModelAssessmentData";

export function ensureAllModelOverviewFeatureCohortsViewElementsAfterSelectionArePresent(
  datasetShape: IModelAssessmentData
): void {
  cy.get(Locators.ModelOverviewFeatureSelection).should("exist");
  cy.get(Locators.ModelOverviewFeatureConfigurationActionButton).should(
    "exist"
  );
  if (datasetShape?.isObjectDetection === true) {
    cy.get(Locators.ModelOverviewHeatmapVisualDisplayToggle).should("not.exist");
  }
  else {
    cy.get(Locators.ModelOverviewHeatmapVisualDisplayToggle).should("exist");
  }
  cy.get(Locators.ModelOverviewDatasetCohortStatsTable).should("not.exist");
  cy.get(Locators.ModelOverviewDisaggregatedAnalysisTable).should("exist");
}
