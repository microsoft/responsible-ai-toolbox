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
import {
  ICategoricalRange,
  INumericRange,
  RangeTypes
} from "@responsible-ai/mlchartlib";

import { IModelAssessmentDashboardProps } from "../ModelAssessmentDashboardProps";

import { CohortColumnNames } from "./ProcessPreBuiltCohort";

export function processPreBuiltDatasetCohort(
  props: IModelAssessmentDashboardProps,
  modelType: ModelTypes,
  featureRanges: {
    [key: string]: INumericRange | ICategoricalRange;
  }
): DatasetCohort[] {
  const datasetCohorts: DatasetCohort[] = [];
  if (props.cohortData) {
    for (const preBuiltCohort of props.cohortData) {
      const filterList: IFilter[] = [];
      preBuiltCohort.cohort_filter_list.forEach((preBuiltCohortFilter) => {
        switch (preBuiltCohortFilter.column) {
          case CohortColumnNames.Index: {
            const filter: IFilter = {
              arg: preBuiltCohortFilter.arg,
              column: DatasetCohortColumns.Index,
              method: preBuiltCohortFilter.method
            };
            filterList.push(filter);
            break;
          }
          case CohortColumnNames.RegressionError: {
            const filter: IFilter = {
              arg: preBuiltCohortFilter.arg,
              column: DatasetCohortColumns.RegressionError,
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
              featureRanges
            );
            filterList.push(filter);
            break;
          }
          default: {
            const filter = translateCohortFilterForDataset(
              preBuiltCohortFilter,
              featureRanges
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
        modelType,
        featureRanges,
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
  featureRanges: {
    [key: string]: INumericRange | ICategoricalRange;
  }
): IFilter {
  let index: number[] = [];
  const featureRange = featureRanges[DatasetCohortColumns.ClassificationError];
  if (featureRange) {
    const allowedClassificationErrorValues = (featureRange as ICategoricalRange)
      .uniqueValues;
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
  featureRanges: {
    [key: string]: INumericRange | ICategoricalRange;
  }
): IFilter | undefined {
  if (
    preBuiltCohortFilter.method === FilterMethods.Includes ||
    preBuiltCohortFilter.method === FilterMethods.Excludes
  ) {
    const featureRange = featureRanges[preBuiltCohortFilter.column];
    if (featureRange?.rangeType !== RangeTypes.Categorical) {
      return undefined;
    }
    let index: number[] = [];
    const categoricalValues = featureRange?.uniqueValues;
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
