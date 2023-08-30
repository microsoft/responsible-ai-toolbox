// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Locators } from "../Constants";
import { IModelAssessmentData } from "../IModelAssessmentData";

export function ensureAllModelOverviewBasicElementsArePresent(
  datasetShape: IModelAssessmentData
): void {
  cy.get(Locators.ModelOverviewHeader).should("exist");
  cy.get(Locators.ModelOverviewDescription).should("exist");
  cy.get(Locators.ModelOverviewCohortViewSelector).should("exist");
  // when there are 2 pivot items, with overflow, it will have a hidden overflow button, so the length is 3
  cy.get(Locators.ModelOverviewCohortViewSelectorButtons).should(
    "have.length",
    3
  );
  cy.get(Locators.ModelOverviewMetricSelection).should("exist");

  if (datasetShape.isObjectDetection) {
    cy.get(Locators.ModelOverviewAggregateMethod).should("exist");
    cy.get(Locators.ModelOverviewClassSelector).should("exist");
    cy.get(Locators.ModelOverviewIoUThresholdSlider).should("exist");
  }
}
