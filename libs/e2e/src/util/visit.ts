// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { modelAssessmentDatasets } from "../lib/describer/modelAssessment/datasets/modelAssessmentDatasets";
import { RAINotebookNames } from "../lib/describer/modelAssessment/IModelAssessmentData";

function isRAINotebookName(
  name: string | number
): name is keyof typeof RAINotebookNames {
  return (
    typeof name === "string" &&
    Object.prototype.hasOwnProperty.call(RAINotebookNames, name)
  );
}

export function visit(
  name?: keyof typeof modelAssessmentDatasets,
  relativePath = "/"
): void {
  const hosts = Cypress.env().hosts as Record<string, string> | undefined;
  if (!name || !isRAINotebookName(name)) {
    return;
  }
  if (!hosts || !name) {
    cy.visit(relativePath);
    return;
  }
  const fileName = RAINotebookNames[name];
  const host = hosts[fileName];
  if (!host) {
    throw new Error(`No host configured for ${fileName}.`);
  }
  const url = new URL(relativePath, host);
  cy.task("log", url.href);
  cy.visit(url.href);
}
