// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IModelAssessmentData } from "../IModelAssessmentData";

export function getNumberOfCohorts(
  datasetShape: IModelAssessmentData,
  includeNewCohort: boolean
): number {
  const initialCohorts = datasetShape.modelOverviewData?.initialCohorts;
  return (initialCohorts?.length || 0) + (includeNewCohort ? 1 : 0);
}
