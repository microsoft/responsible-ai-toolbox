// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Locators } from "../Constants";
import { expect } from "chai";
import { IModelAssessmentData } from "../IModelAssessmentData";

export function ensureAllVisionDataExplorerFlyoutElementsAfterSelectionArePresent(
    datasetShape: IModelAssessmentData
): void {
  cy.get(Locators.VisionDataExplorerImageExplorerViewButton).click();

  cy.get(Locators.VisionDataExplorerImageExplorerViewSuccessImage)
    .should("be.visible")
    .and(($image) => {
        // verifies the image is loaded
        expect($image[0].naturalWidth).to.be.greaterThan(0);
        expect($image[0].naturalHeight).to.be.greaterThan(0);
    });
  // before
  cy.get(Locators.VisionDataExplorerImageExplorerViewSuccessImage).click();

  cy.get(Locators.VisionDataExplorerFlyoutPredictionTitle).should("exist");

  cy.get(Locators.VisionDataExplorerFlyoutPredictionLabel).invoke("text").then((predLabel) => {
    cy.get(Locators.VisionDataExplorerFlyoutGroundTruthLabel).invoke("text").should((gtLabel) => {
        expect(predLabel).to.equal(gtLabel)
    });
  });

  cy.get(Locators.VisionDataExplorerFlyoutImage)
    .should("be.visible")
    .and(($image) => {
        // verifies the image is loaded
        expect($image[0].naturalWidth).to.be.greaterThan(0);
        expect($image[0].naturalHeight).to.be.greaterThan(0);
    });

  // only for non-OD
  if (datasetShape.isObjectDetection) {
    cy.get(Locators.VisionDataExplorerFlyoutObjectSelection).should("exist");
  } else {
    cy.get(Locators.VisionDataExplorerFlyoutExplanationImage).should("exist");
  }
  cy.get(Locators.VisionDataExplorerFlyoutMetadata).should("exist");

  // TODO: after
  cy.get(Locators.VisionDataExplorerFlyoutCloseButton).click();

}
