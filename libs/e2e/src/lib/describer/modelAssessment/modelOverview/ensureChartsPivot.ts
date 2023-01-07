// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Locators } from "../Constants";
import { IModelAssessmentData } from "../IModelAssessmentData";

import { assertChartVisibility, getAvailableCharts } from "./charts";

export function ensureChartsPivot(datasetShape: IModelAssessmentData): void {
  cy.get(Locators.ModelOverviewCohortViewDatasetCohortViewButton).click();
  const availableCharts = getAvailableCharts(
    datasetShape.isRegression,
    datasetShape.isBinary
  );
  cy.get(Locators.ModelOverviewChartPivotItems).as("chartPivotItems");
  availableCharts.forEach((chartName, index) => {
    cy.get("@chartPivotItems").then(($pivotItems) => {
      $pivotItems[index].click();
    });
    assertChartVisibility(datasetShape, false, false, chartName);
  });
}
