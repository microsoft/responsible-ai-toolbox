// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  ICompositeFilter,
  Operations,
  FilterMethods,
  JointDataset,
  ErrorCohortStats,
  ErrorCohort,
  Metrics,
  MetricCohortStats,
  IErrorAnalysisMatrix,
  IErrorAnalysisMatrixCategory,
  IErrorAnalysisMatrixNode
} from "@responsible-ai/core-ui";

import { IMatrixAreaProps } from "./MatrixAreaProps";

export async function fetchMatrix(
  props: IMatrixAreaProps
): Promise<IErrorAnalysisMatrix | undefined> {
  if (!props.getMatrix && props.matrix) {
    return props.matrix;
  }
  if (
    props.getMatrix === undefined ||
    (!props.selectedFeature1 && !props.selectedFeature2)
  ) {
    return undefined;
  }
  const filtersRelabeled = ErrorCohort.getLabeledFilters(
    props.baseCohort.cohort.filters,
    props.baseCohort.jointDataset
  );
  const compositeFiltersRelabeled = ErrorCohort.getLabeledCompositeFilters(
    props.baseCohort.cohort.compositeFilters,
    props.baseCohort.jointDataset
  );
  const selectedFeature1: string | undefined =
    props.selectedFeature1 || props.selectedFeature2;
  const selectedFeature2: string | undefined =
    props.selectedFeature2 === props.selectedFeature1
      ? undefined
      : props.selectedFeature2;
  // Note: edge case, if both features selected are the same one, show just a row
  return props.getMatrix(
    [
      [selectedFeature1, selectedFeature2],
      filtersRelabeled,
      compositeFiltersRelabeled
    ],
    new AbortController().signal
  );
}

export function createCohortStatsFromSelectedCells(
  selectedCells: boolean[],
  jsonMatrix: IErrorAnalysisMatrix
): MetricCohortStats {
  let falseCohortCount = 0;
  let totalCohortCount = 0;
  let metricName = Metrics.ErrorRate;
  let totalCohortError = 0;
  let totalError = 0;
  let falseCount = 0;
  let totalCount = 0;
  let existsSelectedCell = false;
  jsonMatrix.matrix.forEach((row: IErrorAnalysisMatrixNode[], i: number) => {
    row.forEach((value: IErrorAnalysisMatrixNode, j: number) => {
      if (selectedCells !== undefined && selectedCells[j + i * row.length]) {
        if (value.falseCount !== undefined) {
          falseCohortCount += value.falseCount;
        } else if (value.metricValue !== undefined) {
          metricName = value.metricName;
          if (value.metricName === Metrics.MeanSquaredError) {
            totalCohortError += value.metricValue * value.count;
          }
        }
        totalCohortCount += value.count;
        existsSelectedCell = true;
      }
      if (value.falseCount !== undefined) {
        falseCount += value.falseCount;
      } else if (value.metricValue !== undefined) {
        metricName = value.metricName;
        if (value.metricName === Metrics.MeanSquaredError) {
          totalError += value.metricValue * value.count;
        }
      }
      totalCount += value.count;
    });
  });
  let metricValue: number;
  if (existsSelectedCell) {
    if (metricName === Metrics.ErrorRate) {
      metricValue = (falseCohortCount / totalCohortCount) * 100;
      return new ErrorCohortStats(
        falseCohortCount,
        totalCohortCount,
        falseCount,
        totalCount,
        metricValue,
        metricName
      );
    }
    metricValue = totalCohortError / totalCohortCount;
    const coverage = (totalCohortError / totalError) * 100;
    return new MetricCohortStats(
      totalCohortCount,
      totalCount,
      metricValue,
      metricName,
      coverage
    );
  }
  if (metricName === Metrics.ErrorRate) {
    metricValue = (falseCount / totalCount) * 100;
    return new ErrorCohortStats(
      falseCount,
      totalCount,
      falseCount,
      totalCount,
      metricValue,
      metricName
    );
  }
  metricValue = totalError / totalCount;
  const coverage = 100;
  return new MetricCohortStats(
    totalCohortCount,
    totalCount,
    metricValue,
    metricName,
    coverage
  );
}

export function createCompositeFilterFromCells(
  selectedCells: boolean[],
  jsonMatrix: IErrorAnalysisMatrix,
  selectedFeature1: string | undefined,
  selectedFeature2: string | undefined,
  baseCohort: ErrorCohort,
  features: string[]
): ICompositeFilter[] {
  const feature2IsSelected =
    selectedFeature2 && selectedFeature2 !== selectedFeature1;
  // Extract categories
  let [category1Values, cat1HasIntervals] = extractCategories(
    jsonMatrix.category1
  );
  let [category2Values, cat2HasIntervals] = extractCategories(
    jsonMatrix.category2
  );
  const numCols = feature2IsSelected
    ? jsonMatrix.matrix[0].length
    : jsonMatrix.matrix.length;
  const numRows = feature2IsSelected
    ? jsonMatrix.matrix.length
    : jsonMatrix.matrix[0].length;
  const multiCellCompositeFilters: ICompositeFilter[] = [];
  let keyFeature1 = undefined;
  let keyFeature2 = undefined;
  if (feature2IsSelected && selectedFeature1) {
    // Vertical case, where feature 2 is selected and feature 1 is not
    keyFeature2 = getKey(selectedFeature2, features);
    category2Values = category1Values;
    cat2HasIntervals = cat1HasIntervals;
    category1Values = [];
    cat1HasIntervals = false;
  } else {
    keyFeature1 = getKey(selectedFeature1, features);
    if (feature2IsSelected) {
      keyFeature2 = getKey(selectedFeature2, features);
    }
  }
  // Create filters based on the selected cells in the matrix filter
  for (let i = 0; i < numRows; i++) {
    for (let j = 0; j < numCols; j++) {
      const index = j + i * numCols;
      const cellCompositeFilters: ICompositeFilter[] = [];
      if (selectedCells[index]) {
        if (category1Values.length > 0 && keyFeature1) {
          if (cat1HasIntervals) {
            cellCompositeFilters.push({
              arg: [
                category1Values[i].minIntervalCat,
                category1Values[i].maxIntervalCat
              ],
              column: keyFeature1,
              method: FilterMethods.InTheRangeOf
            });
          } else {
            let cat1arg = category1Values[i].value;
            if (typeof cat1arg == "string") {
              cat1arg = baseCohort.jointDataset.metaDict[
                keyFeature1
              ].sortedCategoricalValues?.indexOf(cat1arg);
            }
            cellCompositeFilters.push({
              arg: [cat1arg],
              column: keyFeature1,
              method: FilterMethods.Equal
            });
          }
        }
        if (category2Values.length > 0 && keyFeature2) {
          if (cat2HasIntervals) {
            cellCompositeFilters.push({
              arg: [
                category2Values[j].minIntervalCat,
                category2Values[j].maxIntervalCat
              ],
              column: keyFeature2,
              method: FilterMethods.InTheRangeOf
            });
          } else {
            let cat2arg = category2Values[j].value;
            if (typeof cat2arg == "string") {
              cat2arg = baseCohort.jointDataset.metaDict[
                keyFeature2
              ].sortedCategoricalValues?.indexOf(cat2arg);
            }
            cellCompositeFilters.push({
              arg: [cat2arg],
              column: keyFeature2,
              method: FilterMethods.Equal
            });
          }
        }
        const singleCellCompositeFilter: ICompositeFilter = {
          compositeFilters: cellCompositeFilters,
          operation: Operations.And
        };
        multiCellCompositeFilters.push(singleCellCompositeFilter);
      }
    }
  }
  const compositeFilters: ICompositeFilter[] = [];
  if (multiCellCompositeFilters.length > 0) {
    const multiCompositeFilter: ICompositeFilter = {
      compositeFilters: multiCellCompositeFilters,
      operation: Operations.Or
    };
    compositeFilters.push(multiCompositeFilter);
  }
  return compositeFilters;
}

export function extractCategories(
  category?: IErrorAnalysisMatrixCategory
): [any[], boolean] {
  if (category === undefined) {
    return [[], false];
  }
  const categoryValues = [];
  let catHasIntervals = false;
  for (let i = 0; i < category.values.length; i++) {
    const value = category.values[i];
    if (
      category.intervalMin &&
      category.intervalMax &&
      category.intervalMin.length > 0 &&
      category.intervalMax.length > 0
    ) {
      const minIntervalCat = category.intervalMin[i];
      const maxIntervalCat = category.intervalMax[i];
      categoryValues.push({ maxIntervalCat, minIntervalCat, value });
      catHasIntervals = true;
    } else {
      categoryValues.push({ value });
      catHasIntervals = false;
    }
  }
  return [categoryValues, catHasIntervals];
}

function getKey(
  feature: string | undefined,
  features: string[]
): string | undefined {
  if (!feature) {
    return undefined;
  }
  const index = features.indexOf(feature);
  return JointDataset.DataLabelRoot + index.toString();
}
