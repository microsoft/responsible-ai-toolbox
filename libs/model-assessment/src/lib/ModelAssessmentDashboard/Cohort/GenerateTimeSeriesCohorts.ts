// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  ErrorCohort,
  JointDataset,
  IFilter,
  FilterMethods,
  Cohort,
  CohortSource,
  IDataset
} from "@responsible-ai/core-ui";

import { translatePreBuiltCohortFilterForDataset } from "./ProcessPreBuiltCohort";

export function generateTimeSeriesCohorts(
  defaultErrorCohort: ErrorCohort,
  preBuiltErrorCohortList: ErrorCohort[],
  dataset: IDataset,
  jointDataset: JointDataset
): ErrorCohort[] {
  if (
    dataset.feature_metadata?.time_series_id_features &&
    dataset.feature_metadata?.time_series_id_features.length > 0
  ) {
    // Need to generate time series as cohorts for forecasting.
    const timeSeriesIdFeatureIndices =
      dataset.feature_metadata.time_series_id_features.map((featureName) =>
        dataset.feature_names.indexOf(featureName)
      );
    const distinctTimeSeriesIds = new Set<string>();
    dataset.features.forEach((row) => {
      const timeSeriesId = timeSeriesIdFeatureIndices.map(
        (index) => row[index]
      );
      distinctTimeSeriesIds.add(JSON.stringify(timeSeriesId));
    });

    preBuiltErrorCohortList = [];
    distinctTimeSeriesIds.forEach((timeSeriesId) => {
      const timeSeriesIdArray = JSON.parse(timeSeriesId);
      const filterList: IFilter[] = [];
      const cohortNameParts: string[] = [];
      dataset.feature_metadata?.time_series_id_features?.forEach(
        (feature: string, index: number) => {
          const value = timeSeriesIdArray[index];
          const [filter] = translatePreBuiltCohortFilterForDataset(
            {
              arg: [value],
              column: feature,
              method: FilterMethods.Includes
            },
            jointDataset
          );
          if (filter) {
            filterList.push(filter);
            cohortNameParts.push(`${feature} = ${value}`);
          }
        }
      );
      const cohort = new Cohort(
        cohortNameParts.join(", "),
        jointDataset,
        filterList
      );
      const errorCohortEntry = new ErrorCohort(
        cohort,
        jointDataset,
        undefined,
        CohortSource.Prebuilt
      );
      preBuiltErrorCohortList.push(errorCohortEntry);
    });
  } else {
    // no time series ID features specified
    // assume that the entire dataset is a single time series
    const timeSeriesCohort = new ErrorCohort(
      defaultErrorCohort.cohort,
      jointDataset,
      0,
      CohortSource.Prebuilt,
      false,
      defaultErrorCohort.cohortStats,
      false // technically it is all data, but we don't want it to get filtered out
    );
    preBuiltErrorCohortList = [timeSeriesCohort];
  }
  return preBuiltErrorCohortList;
}
