// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Cohort } from "@responsible-ai/core-ui";

export function getCohortFilterCount(cohort: Cohort): number {
  return cohort.filters.length + cohort.compositeFilters.length;
}
