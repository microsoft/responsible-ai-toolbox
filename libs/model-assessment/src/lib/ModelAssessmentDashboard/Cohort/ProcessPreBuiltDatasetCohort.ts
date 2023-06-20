// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  CohortSource,
  DatasetCohort,
  DatasetCohortColumns,
  FilterMethods,
  IDataset,
  IFilter,
  IPreBuiltFilter,
  IsClassifier,
  ModelTypes
} from "@responsible-ai/core-ui";
import { IColumnRange, RangeTypes } from "@responsible-ai/mlchartlib";

import { IModelAssessmentDashboardProps } from "../ModelAssessmentDashboardProps";

import { CohortColumnNames } from "./ProcessPreBuiltCohort";

export function processPreBuiltDatasetCohort(
  props: IModelAssessmentDashboardProps,
  modelType: ModelTypes,
  columnRanges: {
    [key: string]: IColumnRange;
  }
): DatasetCohort[] {
  const datasetCohorts: DatasetCohort[] = [];
  if (props.cohortData) {
    for (const preBuiltCohort of props.cohortData) {
      const filterList: IFilter[] = [];
      preBuiltCohort.cohort_filter_list.forEach((preBuiltCohortFilter) => {
        switch (preBuiltCohortFilter.column) {
          case CohortColumnNames.RegressionError:
          case CohortColumnNames.Index: {
            let column = DatasetCohortColumns.Index;
            if (
              preBuiltCohortFilter.column === CohortColumnNames.RegressionError
            ) {
              column = DatasetCohortColumns.RegressionError;
            }
            const filter: IFilter = {
              arg: preBuiltCohortFilter.arg,
              column,
              method: preBuiltCohortFilter.method
            };
            filterList.push(filter);
            break;
          }
          case CohortColumnNames.TrueY:
          case CohortColumnNames.PredictedY: {
            const filter = translateCohortFilterForTarget(
              preBuiltCohortFilter,
              props.dataset,
              modelType,
              preBuiltCohortFilter.column
            );
            filterList.push(filter);
            break;
          }
          case CohortColumnNames.ClassificationOutcome: {
            const filter = translateCohortFilterForClassificationOutcome(
              preBuiltCohortFilter,
              columnRanges
            );
            filterList.push(filter);
            break;
          }
          default: {
            const filter = translateCohortFilterForDataset(
              preBuiltCohortFilter,
              columnRanges
            );
            if (filter) {
              filterList.push(filter);
            }
            break;
          }
        }
      });
      const datasetCohort = new DatasetCohort(
        preBuiltCohort.name,
        props.dataset,
        filterList,
        [],
        modelType,
        columnRanges,
        CohortSource.Prebuilt
      );
      datasetCohorts.push(datasetCohort);
    }
  }
  return datasetCohorts;
}

function translateCohortFilterForTarget(
  preBuiltCohortFilter: IPreBuiltFilter,
  dataset: IDataset,
  modelType: ModelTypes,
  cohortColumn: CohortColumnNames
): IFilter {
  const filterColumn =
    cohortColumn === CohortColumnNames.TrueY
      ? DatasetCohortColumns.TrueY
      : DatasetCohortColumns.PredictedY;
  if (IsClassifier(modelType)) {
    const modelClasses = dataset.class_names;
    if (modelClasses) {
      const index = preBuiltCohortFilter.arg
        .map((modelClass) => modelClasses?.indexOf(modelClass))
        .filter((index) => index !== -1);
      index.sort((a, b) => a - b);
      const filter: IFilter = {
        arg: index,
        column: cohortColumn,
        method: preBuiltCohortFilter.method
      };
      return filter;
    }
  }
  const filter: IFilter = {
    arg: preBuiltCohortFilter.arg,
    column: filterColumn,
    method: preBuiltCohortFilter.method
  };
  return filter;
}

function translateCohortFilterForClassificationOutcome(
  preBuiltCohortFilter: IPreBuiltFilter,
  columnRanges: {
    [key: string]: IColumnRange;
  }
): IFilter {
  let index: number[] = [];
  const columnRange = columnRanges[DatasetCohortColumns.ClassificationError];
  if (columnRange) {
    const allowedClassificationErrorValues = columnRange.sortedUniqueValues;
    index = preBuiltCohortFilter.arg
      .map((classificationError) =>
        allowedClassificationErrorValues.indexOf(classificationError)
      )
      .filter((index) => index !== -1);
  }
  index.sort((a, b) => a - b);
  const filter: IFilter = {
    arg: index,
    column: DatasetCohortColumns.ClassificationError,
    method: preBuiltCohortFilter.method
  };
  return filter;
}

function translateCohortFilterForDataset(
  preBuiltCohortFilter: IPreBuiltFilter,
  columnRanges: {
    [key: string]: IColumnRange;
  }
): IFilter | undefined {
  if (
    preBuiltCohortFilter.method === FilterMethods.Includes ||
    preBuiltCohortFilter.method === FilterMethods.Excludes
  ) {
    const columnRange = columnRanges[preBuiltCohortFilter.column];
    if (columnRange?.rangeType !== RangeTypes.Categorical) {
      return undefined;
    }
    let index: number[] = [];
    const categoricalValues = columnRange?.sortedUniqueValues;
    if (categoricalValues) {
      index = preBuiltCohortFilter.arg
        .map((categoricalValue) => categoricalValues.indexOf(categoricalValue))
        .filter((index) => index !== -1);
      index.sort((a, b) => a - b);
      const filter: IFilter = {
        arg: index,
        column: preBuiltCohortFilter.column,
        method: preBuiltCohortFilter.method
      };
      return filter;
    }
  }
  return preBuiltCohortFilter;
}
