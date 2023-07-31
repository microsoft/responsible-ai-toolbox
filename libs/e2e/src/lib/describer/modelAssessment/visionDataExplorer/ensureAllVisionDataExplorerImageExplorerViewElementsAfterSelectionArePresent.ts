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
  cy.get(Locators.VisionDataExplorerImageExplorerViewSuccessImage)
    .should("be.visible")
    .and(($image) => {
        // verifies the image is loaded
        expect(($image[0] as HTMLImageElement).naturalWidth).to.be.greaterThan(0);
        expect(($image[0] as HTMLImageElement).naturalHeight).to.be.greaterThan(0);
    });
//   cy.get(Locators.VisionDataExplorerImageExplorerViewErrorInstanceCount).should(
//     "include.text",
//     datasetShape.visionDataExplorerData?.errorInstances
//   );
  cy.get(Locators.VisionDataExplorerImageExplorerViewSuccessInstances).should(
    "include.text",
    "Success instances"
  );
//   cy.get(
//     Locators.VisionDataExplorerImageExplorerViewSuccessInstanceCount
//   ).should(
//     "include.text",
//     datasetShape.visionDataExplorerData?.successInstances
//   );

  cy.get(
    Locators.VisionDataExplorerImageExplorerViewErrorImageContainer
  ).should("exist");
  cy.get(
    Locators.VisionDataExplorerImageExplorerViewSuccessImageContainer
  ).should("exist");

//   cy.get(Locators.VisionDataExplorerImageExplorerViewImagePredictedY)
//     .invoke("text")
//     .then((text1) => {
//       cy.get(Locators.VisionDataExplorerImageExplorerViewImageTrueY)
//         .invoke("text")
//         .should((text2) => {
//           expect(text1).to.equal(text2);
//         });
//     });

  cy.get(Locators.VisionDataExplorerPageSizeSelector).should("not.exist");
}
