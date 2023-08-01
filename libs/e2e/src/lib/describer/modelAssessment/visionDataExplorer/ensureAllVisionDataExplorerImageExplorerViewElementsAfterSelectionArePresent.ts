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

  cy.get(Locators.VisionDataExplorerImageExplorerViewSuccessImage, { failOnStatusCode: false }).then(($el) => {
    if ($el.length > 0) {
      // Success element exists, i.e., correct prediction
      cy.get(Locators.VisionDataExplorerImageExplorerViewFailureImage).should("not.exist");
      cy.get(Locators.VisionDataExplorerImageExplorerViewImagePredictedY)
        .invoke("text")
        .then((text1) => {
          cy.get(Locators.VisionDataExplorerImageExplorerViewImageTrueY)
            .invoke("text")
            .should((text2) => {
              expect(text1).to.equal(text2);
            });
        });
    } else {
      // Failure element exists, i.e., error prediction
      cy.get(Locators.VisionDataExplorerImageExplorerViewFailureImage).should("exist");
      cy.get(Locators.VisionDataExplorerImageExplorerViewImagePredictedY)
        .invoke("text")
        .then((text1) => {
          cy.get(Locators.VisionDataExplorerImageExplorerViewImageTrueY)
            .invoke("text")
            .should((text2) => {
              expect(text1).not.equal(text2);
            });
        });
    }
  })

  cy.get(
    Locators.VisionDataExplorerImageExplorerViewErrorImageContainer
  ).should("exist");
  cy.get(
    Locators.VisionDataExplorerImageExplorerViewSuccessImageContainer
  ).should("exist");

  cy.get(Locators.VisionDataExplorerImageExplorerViewSuccessImage).should(
    "exist"
  );

  cy.get(Locators.VisionDataExplorerPageSizeSelector).should("not.exist");
}
