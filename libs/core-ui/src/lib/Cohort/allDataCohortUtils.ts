// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { localization } from "@responsible-ai/localization";

import { Cohort } from "./Cohort";
import { ErrorCohort } from "./ErrorCohort";

export function isAllDataCohort(cohort: Cohort, checkName?: boolean): boolean {
  // Comparing localized strings such as the cohort name is bad.
  // Only comparing the filters is not enough, though, because there
  // could be multiple cohorts without filters.
  return (
    cohort.filters.length === 0 &&
    cohort.compositeFilters.length === 0 &&
    (!checkName || cohort.name === localization.Interpret.Cohort.defaultLabel)
  );
}

export function isAllDataErrorCohort(
  errorCohort: ErrorCohort,
  checkName?: boolean
): boolean {
  return isAllDataCohort(errorCohort.cohort, checkName);
}
