// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Locators } from "../Constants";

export function ensureAllModelOverviewBasicElementsArePresent(): void {
  cy.get(Locators.VisionDataExplorerCohortDropDown).should("exist");

  cy.get(Locators.VisionDataExplorerSearchBox).should("exist");

  cy.get(Locators.VisionDataExplorerThumbnailSize).should("exist");

  // TODO: put in IModelAssessmentData & reference here with datasetShape
  cy.get(Locators.VisionDataExplorerCohortPickerLabel).should("include.text", "Select a dataset cohort to explore");

}
