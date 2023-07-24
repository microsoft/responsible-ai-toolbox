// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Locators } from "../Constants";
import { IModelAssessmentData } from "../IModelAssessmentData";

export function ensureAllVisionDataExplorerImageExplorerViewElementsAfterSelectionArePresent(
    datasetShape: IModelAssessmentData
): void {
    cy.get(Locators.VisionDataExplorerImageExplorerViewButton).click();
  
    cy.get(Locators.VisionDataExplorerPredictedLabel).should("exist");
    cy.get(Locators.VisionDataExplorerLegendFailure).should("exist");
    cy.get(Locators.VisionDataExplorerLegendSuccess).should("exist");

    cy.get(Locators.VisionDataExplorerImageExplorerViewErrorInstances).should("exist");
    cy.get(Locators.VisionDataExplorerImageExplorerViewErrorInstances).should("include.text", datasetShape.visionDataExplorerData?.errorInstances);
    cy.get(Locators.VisionDataExplorerImageExplorerViewSuccessInstances).should("exist");
    cy.get(Locators.VisionDataExplorerImageExplorerViewSuccessInstances).should("include.text", datasetShape.visionDataExplorerData?.successInstances);

    cy.get(Locators.VisionDataExplorerImageExplorerViewErrorImageContainer).should("exist");
    cy.get(Locators.VisionDataExplorerImageExplorerViewSuccessImageContainer).should("exist");

    cy.get(Locators.VisionDataExplorerPageSizeSelector).should("not.exist");
  }