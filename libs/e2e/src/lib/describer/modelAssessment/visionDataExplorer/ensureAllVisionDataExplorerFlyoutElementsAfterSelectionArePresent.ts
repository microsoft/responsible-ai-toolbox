// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { expect } from "chai";

import { Locators } from "../Constants";
import { IModelAssessmentData } from "../IModelAssessmentData";

import "cypress-wait-until";


export function ensureAllVisionDataExplorerFlyoutElementsAfterSelectionArePresent(
  datasetShape: IModelAssessmentData
): void {
  cy.get(Locators.VisionDataExplorerImageExplorerViewButton).click();

  cy.waitUntil(() => {
    cy.reload()
    return Cypress.$(Locators.VisionDataExplorerImageExplorerViewSuccessImage).length > 0
    && (Cypress.$(Locators.VisionDataExplorerImageExplorerViewSuccessImage)[0] as HTMLImageElement).naturalWidth > 0
    && (Cypress.$(Locators.VisionDataExplorerImageExplorerViewSuccessImage)[0] as HTMLImageElement).naturalHeight > 0;
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

    cy.waitUntil(() => {
      cy.reload()
      return Cypress.$(Locators.VisionDataExplorerFlyoutImage).length > 0
      && (Cypress.$(Locators.VisionDataExplorerFlyoutImage)[0] as HTMLImageElement).naturalWidth > 0
      && (Cypress.$(Locators.VisionDataExplorerFlyoutImage)[0] as HTMLImageElement).naturalHeight > 0;
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
