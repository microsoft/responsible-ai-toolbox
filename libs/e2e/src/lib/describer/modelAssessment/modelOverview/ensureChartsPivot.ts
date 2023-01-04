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
    let pivotItem = cy.get("@chartPivotItems").first();
    for (let i = 0; i < index; i++) {
      pivotItem = pivotItem.next();
    }
    pivotItem.click();
    assertChartVisibility(
      chartName,
      datasetShape.isRegression,
      datasetShape.isBinary
    );
  });
}
