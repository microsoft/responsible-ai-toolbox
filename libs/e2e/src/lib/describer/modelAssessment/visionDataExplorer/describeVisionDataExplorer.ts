// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { visit } from "../../../../util/visit";
import { modelAssessmentDatasets } from "../datasets/modelAssessmentDatasets";
import { IModelAssessmentData } from "../IModelAssessmentData";
import { ensureAllVisionDataExplorerBasicElementsArePresent } from "./ensureAllVisionDataExplorerBasicElementsArePresent";


const testName = "VisionDataExplorer";

export function describeVisionDataExplorer(
  datasetShape: IModelAssessmentData,
  name?: keyof typeof modelAssessmentDatasets
): void {
  describe(testName, () => {
    before(() => {
      visit(name);
      cy.get("#ModelAssessmentDashboard").should("exist");
    });

    ensureAllVisionDataExplorerBasicElementsArePresent();
  });
}
