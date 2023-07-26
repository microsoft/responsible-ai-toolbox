// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Locators } from "../Constants";
import { expect } from "chai";

export function ensureAllVisionDataExplorerFlyoutElementsAfterSelectionArePresent(): void {
  cy.get(Locators.VisionDataExplorerImageExplorerViewButton).click();

  // TODO: click on flyout and get basic elements, then exit
  cy.get(Locators.VisionDataExplorerImageExplorerViewErrorImage)
    .should("be.visible")
    .and(($image) => {
        // verifies the image is loaded
        expect($img[0].naturalWidth).to.be.greaterThan(0);
        expect($img[0].naturalHeight).to.be.greaterThan(0);
    });
  cy.get(Locators.VisionDataExplorerImageExplorerViewErrorImage).click();
}
