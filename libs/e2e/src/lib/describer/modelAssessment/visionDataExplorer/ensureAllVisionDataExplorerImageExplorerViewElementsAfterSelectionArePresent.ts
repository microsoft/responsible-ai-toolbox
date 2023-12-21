// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Locators } from "../Constants";
import { IModelAssessmentData } from "../IModelAssessmentData";

export function ensureAllVisionDataExplorerImageExplorerViewElementsAfterSelectionArePresent(
  datasetShape: IModelAssessmentData
): void {
  cy.get(Locators.VisionDataExplorerImageExplorerViewButton).click();

  if (datasetShape.isObjectDetection) {
    cy.get(
      Locators.VisionDataExplorerImageExplorerViewObjectDetectionContainer
    ).should("exist");

    cy.get(
      Locators.VisionDataExplorerImageExplorerViewImageODAggLabelCorrect
    ).should("exist");
    cy.get(
      Locators.VisionDataExplorerImageExplorerViewImageODAggLabelIncorrect
    ).should("exist");
  } else {
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
      Locators.VisionDataExplorerImageExplorerViewErrorInstanceCount
    ).should("exist");
    cy.get(
      Locators.VisionDataExplorerImageExplorerViewSuccessInstanceCount
    ).should("exist");
    cy.get(
      Locators.VisionDataExplorerImageExplorerViewErrorImageContainer
    ).should("exist");
    cy.get(
      Locators.VisionDataExplorerImageExplorerViewSuccessImageContainer
    ).should("exist");

    cy.get(Locators.VisionDataExplorerImageExplorerViewImagePredictedY).should(
      "exist"
    );
    cy.get(Locators.VisionDataExplorerImageExplorerViewImageTrueY).should(
      "exist"
    );
  }

  cy.get(Locators.VisionDataExplorerImageExplorerViewImage).should("exist");

  cy.get(Locators.VisionDataExplorerPageSizeSelector).should("not.exist");
}
