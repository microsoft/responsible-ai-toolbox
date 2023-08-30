// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { expect } from "chai";

import { Locators } from "../Constants";
import { IModelAssessmentData } from "../IModelAssessmentData";

export function ensureAllVisionDataExplorerFlyoutElementsAfterSelectionArePresent(
  datasetShape: IModelAssessmentData
): void {
  cy.get(Locators.VisionDataExplorerImageExplorerViewButton).click();

  // waits until the image is actually visible, and then performs assertions
  cy.waitUntil(() =>
    cy.get(Locators.VisionDataExplorerImageExplorerViewSuccessImage, { timeout: 30000 }).should("be.visible"),
    {timeout: 30000}
  ).then(($image) => {
    cy.wait(10000);
    if ($image && $image[0]) {
      // verifies the image is loaded
      expect(($image[0] as HTMLImageElement).naturalWidth).to.be.greaterThan(0);
      expect(($image[0] as HTMLImageElement).naturalHeight).to.be.greaterThan(
        0
      );
    }
  });

  // cy.get(Locators.VisionDataExplorerImageExplorerViewSuccessImage, { timeout: 30000 })
  // .should("be.visible")
  // .and(($image) => {
  //   cy.wait(10000);
  //   // verifies the image is loaded
  //   expect(($image[0] as HTMLImageElement).naturalWidth).to.be.greaterThan(0);
  //   expect(($image[0] as HTMLImageElement).naturalHeight).to.be.greaterThan(
  //     0
  //   );
  // });

  cy.get(Locators.VisionDataExplorerImageExplorerViewSuccessImage).click();

  cy.get(Locators.VisionDataExplorerFlyoutPredictionTitle).should("exist");

  cy.get(Locators.VisionDataExplorerFlyoutPredictionLabel)
    .invoke("text")
    .then((predLabel) => {
      cy.get(Locators.VisionDataExplorerFlyoutGroundTruthLabel)
        .invoke("text")
        .should((gtLabel) => {
          expect(predLabel.split(": ")[1]).to.equal(gtLabel.split(": ")[1]);
        });
    });

  // cy.get(Locators.VisionDataExplorerFlyoutImage, { timeout: 10000 })
  //   .should("be.visible")
  //   .and(($image) => {
  //     cy.wait(10000);
  //     // verifies the image is loaded
  //     expect(($image[0] as HTMLImageElement).naturalWidth).to.be.greaterThan(0);
  //     expect(($image[0] as HTMLImageElement).naturalHeight).to.be.greaterThan(
  //       0
  //     );
  //   });

  if (datasetShape.isObjectDetection) {
    cy.get(Locators.VisionDataExplorerFlyoutObjectSelection).should("exist");
  } else {
    cy.get(Locators.VisionDataExplorerFlyoutExplanationImage).should("exist");
  }
  cy.get(Locators.VisionDataExplorerFlyoutMetadata).should("exist");

  cy.get(Locators.VisionDataExplorerFlyoutCloseButton).click();
}
