// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Locators } from "../Constants";

export function ensureAllVisionDataExplorerClassViewElementsAfterSelectionArePresent(): void {
    cy.get(Locators.VisionDataExplorerClassViewButton).click();

    cy.get(Locators.VisionDataExplorerPageSizeSelector).should("exist");

    // TODO: label types & display widgets
    // pagebox
}