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
  if (filters.length === 0) {
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
  jointDataset: JointDataset,
  globalCohort: ErrorCohort
) {
  return generateFiltersCartesianProduct(filters).map((compositeFilter) => {
    const cohortName = getCompositeFilterString(
      [compositeFilter],
      jointDataset
    )[0];
    return new ErrorCohort(
      new Cohort(
        cohortName,
        jointDataset,
        [],
        [compositeFilter, ...globalCohort.cohort.compositeFilters]
      ),
      jointDataset
    );
  });
}

export function generateOverlappingFeatureBasedCohorts(
  globalCohort: ErrorCohort,
  jointDataset: JointDataset,
  dataset: IDataset,
  selectedFeatures: number[]
) {
  // TODO: make nGroupsPerFeature configurable
  const nGroupsPerFeature = 3;
  const filters: ICompositeFilter[][] = [];
  selectedFeatures.forEach((featureIndex) => {
    const featureName = dataset.feature_names[featureIndex];
    const featureMetaName = JointDataset.DataLabelRoot + featureIndex;
    if (dataset.categorical_features.includes(featureName)) {
      const featureFilters = jointDataset.metaDict[
        featureMetaName
      ].sortedCategoricalValues?.map((_category, categoryIndex) => {
        return {
          arg: [categoryIndex],
          column: featureMetaName,
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
        const featureValue = instanceFeatures[featureIndex];
        if (typeof featureValue !== "number") {
          return;
        }
        if (featureValue > max) {
          max = featureValue;
        }
        if (featureValue < min) {
          min = featureValue;
        }
      });

      const intervalWidth = (max - min) / nGroupsPerFeature;
      const featureFilters: ICompositeFilter[] = [
        {
          // left-most bin
          arg: [min + intervalWidth],
          column: featureMetaName,
          method: FilterMethods.LessThan
        }
      ];
      for (
        // middle bins
        let binIndex = 1;
        binIndex < nGroupsPerFeature - 1;
        binIndex++
      ) {
        featureFilters.push({
          compositeFilters: [
            {
              arg: [min + intervalWidth * binIndex],
              column: featureMetaName,
              method: FilterMethods.GreaterThanEqualTo
            },
            {
              arg: [min + intervalWidth * (binIndex + 1)],
              column: featureMetaName,
              method: FilterMethods.LessThan
            }
          ],
          operation: Operations.And
        });
      }
      featureFilters.push({
        // right-most bin
        arg: [min + intervalWidth * (nGroupsPerFeature - 1)],
        column: featureMetaName,
        method: FilterMethods.GreaterThanEqualTo
      });
      filters.push(featureFilters);
    }
  });

  return (
    generateCohortsCartesianProduct(filters, jointDataset, globalCohort)
      // filter the empty cohorts resulting from overlapping dimensions
      .filter((errorCohort) => errorCohort.cohortStats.totalCohort > 0)
  );
}
