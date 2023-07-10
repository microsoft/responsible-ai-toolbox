// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { modelAssessmentDatasets } from "../lib/describer/modelAssessment/datasets/modelAssessmentDatasets";
import { RAINotebookNames } from "../lib/describer/modelAssessment/IModelAssessmentData";
import { RAIVisionNotebookNames } from "../lib/describer/modelAssessmentVision/IModelAssessmentData";

export function visit(
  name?: keyof typeof modelAssessmentDatasets,
  relativePath = "/"
): void {
  let fileName: string;
  const hosts = Cypress.env().hosts;
  if (!name || (!RAINotebookNames[name] && !RAIVisionNotebookNames[name])) {
    return;
  }
  if (!hosts || !name) {
    cy.visit(relativePath);
    return;
  }
  const hostDetails = hosts.find((obj: { file: string }) => {
    if (RAINotebookNames[name]) {
      fileName = RAINotebookNames[name];
    }
    else if (RAIVisionNotebookNames[name]) {
      fileName = RAIVisionNotebookNames[name];
    }
    return obj.file === fileName;
  });
  const url = new URL(relativePath, hostDetails.host);
  cy.task("log", url.href);
  cy.visit(url.href);
}
