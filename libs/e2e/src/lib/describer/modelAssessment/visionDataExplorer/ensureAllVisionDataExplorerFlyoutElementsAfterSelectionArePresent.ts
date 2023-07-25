// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Locators } from "../Constants";

export function ensureAllVisionDataExplorerFlyoutElementsAfterSelectionArePresent(): void {
  cy.get(Locators.VisionDataExplorerImageExplorerViewButton).click();

  // TODO: click on flyout and get basic elements, then exit
}
