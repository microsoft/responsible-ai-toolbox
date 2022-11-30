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
import { localization } from "@responsible-ai/localization";

import { defaultNumberOfContinuousFeatureBins } from "./Constants";

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
): ErrorCohort[] {
  const filtersCartesianProduct = generateFiltersCartesianProduct(filters);
  return filtersCartesianProduct.map((compositeFilter) => {
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
  selectedFeatures: number[],
  numberOfContinuousFeaturebins: { [featureIndex: number]: number }
): ErrorCohort[] {
  const filters: ICompositeFilter[][] = [];
  selectedFeatures.forEach((featureIndex) => {
    const featureFilters = generateFeatureBasedFilters(
      jointDataset,
      dataset,
      featureIndex,
      numberOfContinuousFeaturebins[featureIndex] ??
        defaultNumberOfContinuousFeatureBins
    );
    if (featureFilters) {
      filters.push(featureFilters);
    }
  });

  const nonZeroCohorts = generateCohortsCartesianProduct(
    filters,
    jointDataset,
    globalCohort
  )
    // filter the empty cohorts resulting from overlapping dimensions
    .filter((errorCohort) => errorCohort.cohortStats.totalCohort > 0);

  if (nonZeroCohorts.length > 0) {
    // sort cohort by size
    nonZeroCohorts.sort(
      (a, b) => b.cohortStats.totalCohort - a.cohortStats.totalCohort
    );
  }
  // merge all cohorts into one after the 10th largest cohort
  if (nonZeroCohorts.length > 10) {
    const otherCohorts = nonZeroCohorts.slice(10, -10);
    const otherCompositeFilters: ICompositeFilter[] = [];
    otherCohorts.forEach((cohort) => {
      otherCompositeFilters.push(...cohort.cohort.compositeFilters);
    });
    // merge the composite filters with or operation
    const mergedCompositeFilter = {
      compositeFilters: otherCompositeFilters,
      operation: Operations.Or
    } as ICompositeFilter;
    const mergedOtherCohort = new ErrorCohort(
      new Cohort(
        localization.ModelAssessment.ModelOverview.other,
        jointDataset,
        [],
        [mergedCompositeFilter]
      ),
      jointDataset
    );
    nonZeroCohorts.splice(10, nonZeroCohorts.length - 10);
    nonZeroCohorts.push(mergedOtherCohort);
  }
  return nonZeroCohorts;
}

export function generateFeatureBasedFilters(
  jointDataset: JointDataset,
  dataset: IDataset,
  featureIndex: number,
  nGroupsPerFeature = 3
): ICompositeFilter[] | undefined {
  const featureName = dataset.feature_names[featureIndex];
  const featureMetaName = JointDataset.DataLabelRoot + featureIndex;
  if (dataset.categorical_features.includes(featureName)) {
    return jointDataset.metaDict[featureMetaName].sortedCategoricalValues?.map(
      (_category, categoryIndex) => {
        return {
          arg: [categoryIndex],
          column: featureMetaName,
          method: FilterMethods.Includes
        };
      }
    );
  }
  const { min, max } = getMinMax(
    dataset.features.map((instanceFeatures) => instanceFeatures[featureIndex])
  );

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
  return featureFilters;
}

export function getMinMax(values: unknown[]): { min: number; max: number } {
  let min = Number.MAX_SAFE_INTEGER;
  let max = Number.MIN_SAFE_INTEGER;
  values.forEach((value) => {
    if (typeof value !== "number") {
      return;
    }
    if (value > max) {
      max = value;
    }
    if (value < min) {
      min = value;
    }
  });
  return { max, min };
}
