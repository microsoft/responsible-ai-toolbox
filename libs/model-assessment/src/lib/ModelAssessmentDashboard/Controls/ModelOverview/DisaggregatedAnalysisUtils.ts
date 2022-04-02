// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  Cohort,
  ErrorCohort,
  FilterMethods,
  getCompositeFilterString,
  ICompositeFilter,
  IDataset,
  JointDataset,
  Operations
} from "@responsible-ai/core-ui";

function generateFiltersCartesianProduct(
  filters: ICompositeFilter[][]
): ICompositeFilter[] {
  if (filters.length == 0) {
    return [];
  }
  if (filters.length === 1) {
    // just flatten filters list
    return filters[0];
  }
  return generateFiltersCartesianProduct([
    filters[0]
      .map((filter0) => {
        return filters[1].map((filter1) => {
          return {
            compositeFilters: [filter0, filter1],
            operation: Operations.And
          } as ICompositeFilter;
        });
      })
      .reduce((list1, list2) => [...list1, ...list2]), // flatten
    ...filters.slice(2)
  ]);
}

export function generateCohortsCartesianProduct(
  filters: ICompositeFilter[][],
  jointDataset: JointDataset
) {
  return generateFiltersCartesianProduct(filters).map((compositeFilter) => {
    const cohort_name = getCompositeFilterString(
      [compositeFilter],
      jointDataset
    )[0];
    return new ErrorCohort(
      new Cohort(cohort_name, jointDataset, [], [compositeFilter]),
      jointDataset
    );
  });
}

export function generateOverlappingFeatureBasedCohorts(
  jointDataset: JointDataset,
  dataset: IDataset,
  selectedFeatures: number[]
) {
  // TODO: restrict by current cohort
  // TODO: make n_groups_per_feature configurable
  const n_groups_per_feature = 3;
  let filters: ICompositeFilter[][] = [];
  selectedFeatures.forEach((feature_index) => {
    const feature_name = dataset.feature_names[feature_index];
    const feature_meta_name = JointDataset.DataLabelRoot + feature_index;
    if (dataset.categorical_features.includes(feature_name)) {
      const featureFilters = jointDataset.metaDict[
        feature_meta_name
      ].sortedCategoricalValues?.map((_category, category_index) => {
        return {
          arg: [category_index],
          column: feature_meta_name,
          method: FilterMethods.Includes
        };
      });
      if (featureFilters) {
        filters.push(featureFilters);
      }
    } else {
      let min = Number.MAX_SAFE_INTEGER;
      let max = Number.MIN_SAFE_INTEGER;
      dataset.features.forEach((instanceFeatures) => {
        const feature_value = instanceFeatures[feature_index];
        if (typeof feature_value !== "number") {
          return;
        }
        if (feature_value > max) {
          max = feature_value;
        }
        if (feature_value < min) {
          min = feature_value;
        }
      });
      if (min === Number.MAX_SAFE_INTEGER || max === Number.MIN_SAFE_INTEGER) {
        // TODO: should we have an error message for this?
        return;
      }
      const interval_width = (max - min) / n_groups_per_feature;
      let featureFilters: ICompositeFilter[] = [
        {
          // left-most bin
          arg: [min + interval_width],
          column: feature_meta_name,
          method: FilterMethods.LessThan
        }
      ];
      for (
        // middle bins
        let bin_index = 1;
        bin_index < n_groups_per_feature - 1;
        bin_index++
      ) {
        featureFilters.push({
          compositeFilters: [
            {
              arg: [min + interval_width * bin_index],
              column: feature_meta_name,
              method: FilterMethods.GreaterThanEqualTo
            },
            {
              arg: [min + interval_width * (bin_index + 1)],
              column: feature_meta_name,
              method: FilterMethods.LessThan
            }
          ],
          operation: Operations.And
        });
      }
      featureFilters.push({
        // right-most bin
        arg: [min + interval_width * (n_groups_per_feature - 1)],
        column: feature_meta_name,
        method: FilterMethods.GreaterThanEqualTo
      });
      filters.push(featureFilters);
    }
  });

  return (
    generateCohortsCartesianProduct(filters, jointDataset)
      // filter the empty cohorts resulting from overlapping dimensions
      .filter((errorCohort) => errorCohort.cohortStats.totalCohort > 0)
  );
}
