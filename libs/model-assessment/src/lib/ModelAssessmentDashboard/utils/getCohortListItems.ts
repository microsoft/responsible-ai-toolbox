// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  DatasetCohort,
  ErrorCohort,
  getCohortFilterCount,
  isAllDataErrorCohort
} from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";

import { ICohortListItem } from "../Cohort/CohortList";

export function getErrorCohortListItems(
  errorCohorts: ErrorCohort[],
  showAllDataCohort: boolean
): ICohortListItem[] {
  const allItems = errorCohorts
    .filter(
      (errorCohort: ErrorCohort) =>
        showAllDataCohort || !isAllDataErrorCohort(errorCohort, true)
    )
    .filter((errorCohort: ErrorCohort) => !errorCohort.isTemporary)
    .map((errorCohort: ErrorCohort, index: number) => {
      const details = [
        localization.formatString(
          localization.Interpret.CohortBanner.datapoints,
          errorCohort.cohort.filteredData.length
        ),
        localization.formatString(
          localization.Interpret.CohortBanner.filters,
          getCohortFilterCount(errorCohort.cohort)
        )
      ];
      return {
        coverage: errorCohort.cohortStats.errorCoverage.toFixed(2),
        details,
        key: index,
        metricName: errorCohort.cohortStats.metricName,
        metricValue: errorCohort.cohortStats.metricValue.toFixed(2),
        name: errorCohort.cohort.name
      };
    });
  return allItems;
}

export function getDatasetCohortListItems(
  datasetCohorts: DatasetCohort[]
): ICohortListItem[] {
  //TODO(Ruby): filter !allDataCohort
  const allItems = datasetCohorts
    .filter((cohort) => !cohort.isTemporary)
    .map((cohort, index) => {
      const details = [
        localization.formatString(
          localization.Interpret.CohortBanner.datapoints,
          cohort.selectedIndexes.length
        ),
        localization.formatString(
          localization.Interpret.CohortBanner.filters,
          cohort.filters.length
        )
      ];
      return {
        coverage: cohort.cohortStats.errorCoverage.toFixed(2),
        details,
        key: index,
        metricName: cohort.cohortStats.metricName,
        metricValue: cohort.cohortStats.metricValue.toFixed(2),
        name: cohort.name
      };
    });
  return allItems;
}
