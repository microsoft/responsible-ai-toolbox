// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { createCohort } from "../../../../util/createCohort";
import { Locators } from "../Constants";
import { IModelAssessmentData } from "../IModelAssessmentData";

import { ensureAllModelOverviewDatasetCohortsViewBasicElementsArePresent } from "./ensureAllModelOverviewDatasetCohortsViewBasicElementsArePresent";

export function ensureNewCohortsShowUpInCharts(
  datasetShape: IModelAssessmentData,
  isNotebookTest: boolean,
  isTabular: boolean
): void {
  cy.get(Locators.ModelOverviewCohortViewDatasetCohortViewButton).click();
  ensureAllModelOverviewDatasetCohortsViewBasicElementsArePresent(
    datasetShape,
    false,
    isNotebookTest,
    isTabular
  );
  createCohort(datasetShape.modelOverviewData?.newCohort?.name);
  ensureAllModelOverviewDatasetCohortsViewBasicElementsArePresent(
    datasetShape,
    true,
    isNotebookTest,
    isTabular
  );
}
