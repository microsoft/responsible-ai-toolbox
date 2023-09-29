// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Locators } from "../Constants";

export function ensureAllVisionDataExplorerTableViewElementsAfterSelectionArePresent(): void {
  cy.get(Locators.VisionDataExplorerTableViewButton).click();

  cy.get(Locators.VisionDataExplorerTabsViewTableList).should("exist");

  cy.get(Locators.VisionDataExplorerTabsViewItemsSelectedStatement).should(
    "exist"
  );
  cy.get(Locators.VisionDataExplorerTabsViewSaveCohortButton).should("exist");
}
