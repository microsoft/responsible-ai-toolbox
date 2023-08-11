// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Locators } from "../Constants";

export function ensureAllVisionDataExplorerImageExplorerViewElementsAfterSelectionArePresent(): void {
  cy.get(Locators.VisionDataExplorerImageExplorerViewButton).click();

  cy.get(Locators.VisionDataExplorerPredictedLabel).should("exist");
  cy.get(Locators.VisionDataExplorerLegendFailure).should("exist");
  cy.get(Locators.VisionDataExplorerLegendSuccess).should("exist");

  cy.get(Locators.VisionDataExplorerImageExplorerViewErrorInstances).should(
    "include.text",
    "Error instances"
  );
  cy.get(Locators.VisionDataExplorerImageExplorerViewSuccessInstances).should(
    "include.text",
    "Success instances"
  );

  cy.get(
    Locators.VisionDataExplorerImageExplorerViewErrorImageContainer
  ).should("exist");
  cy.get(
    Locators.VisionDataExplorerImageExplorerViewSuccessImageContainer
  ).should("exist");

  cy.get(Locators.VisionDataExplorerImageExplorerViewImage).should("exist");
  cy.get(Locators.VisionDataExplorerImageExplorerViewImagePredictedY).should(
    "exist"
  );
  cy.get(Locators.VisionDataExplorerImageExplorerViewImageTrueY).should(
    "exist"
  );

  cy.get(Locators.VisionDataExplorerPageSizeSelector).should("not.exist");
}
