// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Locators } from "../Constants";

export function ensureAllVisionDataExplorerBasicElementsArePresent(): void {
  cy.get(Locators.VisionDataExplorerTableViewButton).click();
  constantButtons();

  cy.get(Locators.VisionDataExplorerClassViewButton).click();
  constantButtons();

  cy.get(Locators.VisionDataExplorerImageExplorerViewButton).click();
  constantButtons();
}

function constantButtons(): void {
  cy.get(Locators.VisionDataExplorerCohortDropDown).should("exist");
  cy.get(Locators.VisionDataExplorerSearchBox).should("exist");
  cy.get(Locators.VisionDataExplorerThumbnailSize).should("exist");
}
