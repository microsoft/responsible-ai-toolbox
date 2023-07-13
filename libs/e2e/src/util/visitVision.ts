// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { modelAssessmentVisionDatasets } from "../lib/describer/modelAssessmentVision/datasets/modelAssessmentVisionDatasets";
import { RAIVisionNotebookNames } from "../lib/describer/modelAssessmentVision/IModelAssessmentData";

export function visit(
  name?: keyof typeof modelAssessmentVisionDatasets,
  relativePath = "/"
): void {
  let fileName: string;
  const hosts = Cypress.env().hosts;
  if (!name || !RAIVisionNotebookNames[name]) {
    return;
  }
  if (!hosts || !name) {
    cy.visit(relativePath);
    return;
  }
  const hostDetails = hosts.find((obj: { file: string }) => {
    fileName = RAIVisionNotebookNames[name];
    return obj.file === fileName;
  });
  const url = new URL(relativePath, hostDetails.host);
  cy.task("log", url.href);
  cy.visit(url.href);
}
