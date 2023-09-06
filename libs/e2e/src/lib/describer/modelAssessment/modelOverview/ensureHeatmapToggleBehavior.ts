// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Locators } from "../Constants";

export function ensureHeatmapToggleBehavior(heatmapTable: string): void {
  cy.get(Locators.ModelOverviewHeatmapVisualDisplayToggle).should("exist");
  cy.get(heatmapTable).should("exist");

  // checks the toggle is on
  cy.get(Locators.ModelOverviewHeatmapVisualDisplayToggle).should(
    "have.attr",
    "aria-checked",
    "true"
  );

  // checks there are RGB colors in the heatmap table
  cy.get(heatmapTable)
    .find("path")
    .filter('[fill*="rgb"]')
    .should("have.length.greaterThan", 0);

  // turn off the toggle
  cy.get(Locators.ModelOverviewHeatmapVisualDisplayToggle).click();

  // checks the toggle is off
  cy.get(Locators.ModelOverviewHeatmapVisualDisplayToggle).should(
    "have.attr",
    "aria-checked",
    "false"
  );

  // checks there are no RGB colors in the heatmap table
  cy.get(heatmapTable).find("path").should("not.have.attr", 'fill*="rgb"');

  // turn the toggle back on
  cy.get(Locators.ModelOverviewHeatmapVisualDisplayToggle).click();
}
