// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Locators } from "../Constants";

export function ensureAllVisionDataExplorerClassViewElementsAfterSelectionArePresent(): void {
  cy.get(Locators.VisionDataExplorerClassViewButton).click();

  cy.get(Locators.VisionDataExplorerPageSizeSelector).should("exist");

  cy.get(Locators.VisionDataExplorerClassViewLabelTypeDropdown).should("exist");
  cy.get(Locators.VisionDataExplorerClassViewLabelDisplayDropdown).should(
    "exist"
  );

  cy.get(Locators.VisionDataExplorerClassViewDataCharacteristicsLegend).should(
    "exist"
  );

  cy.get(Locators.VisionDataExplorerClassViewDataCharacteristicsLegend).should(
    "exist"
  );
  cy.get(Locators.VisionDataExplorerClassViewContainer).should("exist");
}
