// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { visit } from "../../../../util/visit";
import { Locators } from "../Constants";
import { modelAssessmentDatasets } from "../datasets/modelAssessmentDatasets";
import { IModelAssessmentData } from "../IModelAssessmentData";

import { ensureAllVisionDataExplorerBasicElementsArePresent } from "./ensureAllVisionDataExplorerBasicElementsArePresent";
import { ensureAllVisionDataExplorerClassViewElementsAfterSelectionArePresent } from "./ensureAllVisionDataExplorerClassViewElementsAfterSelectionArePresent";
import { ensureAllVisionDataExplorerImageExplorerViewElementsAfterSelectionArePresent } from "./ensureAllVisionDataExplorerImageExplorerViewElementsAfterSelectionArePresent";
import { ensureAllVisionDataExplorerTableViewElementsAfterSelectionArePresent } from "./ensureAllVisionDataExplorerTableViewElementsAfterSelectionArePresent";
import {
  ensureAllVisionDataExplorerClassViewElementsBeforeSelectionAreNotPresent,
  ensureAllVisionDataExplorerImageExplorerViewElementsBeforeSelectionAreNotPresent,
  ensureAllVisionDataExplorerTableViewElementsBeforeSelectionAreNotPresent
} from "./ensureAllVisionDataExplorerViewElementsBeforeSelectionAreNotPresent";

const testName = "Vision Data Explorer";

export function describeVisionDataExplorer(
  datasetShape: IModelAssessmentData,
  name?: keyof typeof modelAssessmentDatasets,
  isNotebookTest = true
): void {
  describe(testName, () => {
    if (isNotebookTest) {
      before(() => {
        visit(name);
      });
    } else {
      before(() => {
        cy.visit(`#/modelAssessmentVision/${name}/light/english/Version-2`);
      });
    }

    if (datasetShape.visionDataExplorerData?.hasVisionDataExplorerComponent) {
      it("should have basic components in the initial state", () => {
        ensureAllVisionDataExplorerBasicElementsArePresent();
      });

      it("should show Image explorer view components when selected", () => {
        ensureAllVisionDataExplorerImageExplorerViewElementsAfterSelectionArePresent(
          datasetShape
        );
        ensureAllVisionDataExplorerTableViewElementsBeforeSelectionAreNotPresent();
        ensureAllVisionDataExplorerClassViewElementsBeforeSelectionAreNotPresent();
        cy.get(Locators.VisionDataExplorerPageSizeSelector).should("not.exist");
      });

      it("should show Table view components when selected", () => {
        ensureAllVisionDataExplorerTableViewElementsAfterSelectionArePresent();
        ensureAllVisionDataExplorerImageExplorerViewElementsBeforeSelectionAreNotPresent();
        ensureAllVisionDataExplorerClassViewElementsBeforeSelectionAreNotPresent();
        cy.get(Locators.VisionDataExplorerPageSizeSelector).should("not.exist");
      });

      it("should show Class view components when selected", () => {
        ensureAllVisionDataExplorerClassViewElementsAfterSelectionArePresent();
        ensureAllVisionDataExplorerImageExplorerViewElementsBeforeSelectionAreNotPresent();
        ensureAllVisionDataExplorerTableViewElementsBeforeSelectionAreNotPresent();
      });
    } else {
      it("should not have 'VisionDataExplorer' component", () => {
        cy.get(Locators.VisionDataExplorer).should("not.exist");
      });
    }
  });
}
