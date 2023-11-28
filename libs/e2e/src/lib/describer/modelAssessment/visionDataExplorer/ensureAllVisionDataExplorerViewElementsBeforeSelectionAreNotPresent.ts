// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Locators } from "../Constants";

export function ensureAllVisionDataExplorerImageExplorerViewElementsBeforeSelectionAreNotPresent(): void {
  cy.get(Locators.VisionDataExplorerPredictedLabel).should("not.exist");
  cy.get(Locators.VisionDataExplorerLegendFailure).should("not.exist");
  cy.get(Locators.VisionDataExplorerLegendSuccess).should("not.exist");

  cy.get(Locators.VisionDataExplorerImageExplorerViewErrorInstances).should(
    "not.exist"
  );
  cy.get(Locators.VisionDataExplorerImageExplorerViewErrorInstances).should(
    "not.exist"
  );
  cy.get(Locators.VisionDataExplorerImageExplorerViewErrorInstanceCount).should(
    "not.exist"
  );
  cy.get(Locators.VisionDataExplorerImageExplorerViewSuccessInstances).should(
    "not.exist"
  );
  cy.get(Locators.VisionDataExplorerImageExplorerViewSuccessInstances).should(
    "not.exist"
  );
  cy.get(
    Locators.VisionDataExplorerImageExplorerViewSuccessInstanceCount
  ).should("not.exist");

  cy.get(
    Locators.VisionDataExplorerImageExplorerViewErrorImageContainer
  ).should("not.exist");
  cy.get(
    Locators.VisionDataExplorerImageExplorerViewSuccessImageContainer
  ).should("not.exist");
  cy.get(
    Locators.VisionDataExplorerImageExplorerViewObjectDetectionContainer
  ).should("not.exist");

  cy.get(Locators.VisionDataExplorerImageExplorerViewImagePredictedY).should(
    "not.exist"
  );
  cy.get(Locators.VisionDataExplorerImageExplorerViewImageTrueY).should(
    "not.exist"
  );
  cy.get(
    Locators.VisionDataExplorerImageExplorerViewImageODAggLabelCorrect
  ).should("not.exist");
  cy.get(
    Locators.VisionDataExplorerImageExplorerViewImageODAggLabelIncorrect
  ).should("not.exist");
}

export function ensureAllVisionDataExplorerTableViewElementsBeforeSelectionAreNotPresent(): void {
  cy.get(Locators.VisionDataExplorerTabsViewTableList).should("not.exist");

  cy.get(Locators.VisionDataExplorerTabsViewItemsSelectedStatement).should(
    "not.exist"
  );
  cy.get(Locators.VisionDataExplorerTabsViewSaveCohortButton).should(
    "not.exist"
  );
}

export function ensureAllVisionDataExplorerClassViewElementsBeforeSelectionAreNotPresent(): void {
  cy.get(Locators.VisionDataExplorerClassViewLabelTypeDropdown).should(
    "not.exist"
  );
  cy.get(Locators.VisionDataExplorerClassViewLabelDisplayDropdown).should(
    "not.exist"
  );

  cy.get(Locators.VisionDataExplorerClassViewDataCharacteristicsLegend).should(
    "not.exist"
  );

  cy.get(Locators.VisionDataExplorerClassViewDataCharacteristicsLegend).should(
    "not.exist"
  );
  cy.get(Locators.VisionDataExplorerClassViewContainer).should("not.exist");
}
