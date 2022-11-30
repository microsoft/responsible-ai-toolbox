// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  ICompositeFilter,
  Operations,
  FilterMethods,
  JointDataset,
  ErrorCohort,
  Cohort,
  Metrics,
  MetricCohortStats,
  IErrorAnalysisMatrix,
  IErrorAnalysisMatrixCategory,
  IErrorAnalysisMatrixNode
} from "@responsible-ai/core-ui";

import {
  AccuracyStatsAggregator,
  BaseStats,
  ErrorRateStatsAggregator,
  MetricStatsAggregator,
  PrecisionStatsAggregator,
  RecallStatsAggregator,
  F1ScoreStatsAggregator
} from "./StatsAggregator";

export async function fetchMatrix(
  quantileBinning: boolean,
  numBins: number,
  baseCohort: ErrorCohort,
  selectedFeature1: string | undefined,
  selectedFeature2: string | undefined,
  metric: string | undefined,
  getMatrix?: (
    request: any,
    abortSignal: AbortSignal
  ) => Promise<IErrorAnalysisMatrix>,
  matrix?: IErrorAnalysisMatrix | undefined
): Promise<IErrorAnalysisMatrix | undefined> {
  if (!getMatrix && matrix) {
    return matrix;
  }
  if (
    getMatrix === undefined ||
    !metric ||
    (!selectedFeature1 && !selectedFeature2)
  ) {
    return undefined;
  }
  const filtersRelabeled = Cohort.getLabeledFilters(
    baseCohort.cohort.filters,
    baseCohort.jointDataset
  );
  const compositeFiltersRelabeled = Cohort.getLabeledCompositeFilters(
    baseCohort.cohort.compositeFilters,
    baseCohort.jointDataset
  );
  const selectedFeature1Request: string | undefined =
    selectedFeature1 || selectedFeature2 || undefined;
  const selectedFeature2Request: string | undefined =
    selectedFeature2 === selectedFeature1Request
      ? undefined
      : selectedFeature2 || undefined;
  // Note: edge case, if both features selected are the same one, show just a row
  return getMatrix(
    [
      [selectedFeature1Request, selectedFeature2Request],
      filtersRelabeled,
      compositeFiltersRelabeled,
      quantileBinning,
      numBins,
      metric
    ],
    new AbortController().signal
  );
}

export function createCohortStatsFromSelectedCells(
  selectedCells: boolean[],
  jsonMatrix: IErrorAnalysisMatrix
): MetricCohortStats {
  let metricName = jsonMatrix.matrix[0][0].metricName;
  let statsAggregator: BaseStats;
  // Note for older versions of error analysis package metricName is
  // undefined for ErrorRate
  if (metricName === Metrics.ErrorRate || metricName === undefined) {
    metricName = Metrics.ErrorRate;
    statsAggregator = new ErrorRateStatsAggregator(metricName);
  } else if (
    metricName === Metrics.MeanSquaredError ||
    metricName === Metrics.MeanAbsoluteError
  ) {
    statsAggregator = new MetricStatsAggregator(metricName);
  } else if (
    metricName === Metrics.PrecisionScore ||
    metricName === Metrics.MacroPrecisionScore ||
    metricName === Metrics.MicroPrecisionScore
  ) {
    statsAggregator = new PrecisionStatsAggregator(metricName);
  } else if (
    metricName === Metrics.RecallScore ||
    metricName === Metrics.MacroRecallScore ||
    metricName === Metrics.MicroRecallScore
  ) {
    statsAggregator = new RecallStatsAggregator(metricName);
  } else if (
    metricName === Metrics.F1Score ||
    metricName === Metrics.MacroF1Score ||
    metricName === Metrics.MicroF1Score
  ) {
    statsAggregator = new F1ScoreStatsAggregator(metricName);
  } else if (metricName === Metrics.AccuracyScore) {
    statsAggregator = new AccuracyStatsAggregator(metricName);
  } else {
    throw new Error(`Unknown metric value ${metricName} specified`);
  }
  jsonMatrix.matrix.forEach((row: IErrorAnalysisMatrixNode[], i: number) => {
    row.forEach((value: IErrorAnalysisMatrixNode, j: number) => {
      if (selectedCells !== undefined && selectedCells[j + i * row.length]) {
        statsAggregator.updateCohort(value);
      }
      statsAggregator.updateGlobal(value);
    });
  });
  return statsAggregator.createCohortStats();
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
  if (feature2IsSelected && !selectedFeature1) {
    // Horizontal case, where feature 2 is selected and feature 1 is not
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
              cat1arg =
                baseCohort.jointDataset.metaDict[
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
              cat2arg =
                baseCohort.jointDataset.metaDict[
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
