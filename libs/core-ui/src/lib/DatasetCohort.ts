// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IColumnRange, RangeTypes } from "@responsible-ai/mlchartlib";

import { ErrorCohortStats, MetricCohortStats } from "./Cohort/CohortStats";
import { CohortSource, Metrics } from "./Cohort/Constants";
import { translateToNewFilter } from "./Cohort/ManualCohortManagement/CohortEditorUtils";
import { DatasetCohortColumns } from "./DatasetCohortColumns";
import { IDataset } from "./Interfaces/IDataset";
import { ModelTypes } from "./Interfaces/IExplanationContext";
import {
  FilterMethods,
  ICompositeFilter,
  IFilter,
  Operations
} from "./Interfaces/IFilter";
import { getPropertyValues } from "./util/datasetUtils/getPropertyValues";
import { IsBinary, IsMulticlass } from "./util/ExplanationUtils";
import { MulticlassClassificationEnum } from "./util/JointDatasetUtils";

export class DatasetCohort {
  public selectedIndexes: number[] = [];
  public cohortStats: MetricCohortStats;
  public constructor(
    public name: string,
    public dataset: IDataset,
    public filters: IFilter[] = [],
    public compositeFilters: ICompositeFilter[] = [],
    public modelType?: ModelTypes,
    private columnRanges?: {
      [key: string]: IColumnRange;
    },
    public source: CohortSource = CohortSource.None,
    public isTemporary: boolean = false,
    cohortStats: MetricCohortStats | undefined = undefined,
    public isAllDataCohort: boolean = false
  ) {
    this.name = name;
    this.selectedIndexes = this.applyFilters();
    if (cohortStats) {
      this.cohortStats = cohortStats;
    } else {
      this.cohortStats = this.updateStatsFromData();
    }
  }

  private filterRecursively(
    row: { [key: string]: unknown },
    compositeFilter: ICompositeFilter
  ): boolean {
    if (compositeFilter.method) {
      const filter = translateToNewFilter(
        compositeFilter,
        this.dataset.feature_names
      );
      return !!filter && this.filterRow(row, [filter]);
    }
    return this.filterComposite(
      row,
      compositeFilter.compositeFilters,
      compositeFilter.operation
    );
  }

  private filterComposite(
    row: { [key: string]: unknown },
    compositeFilters: ICompositeFilter[],
    operation: Operations
  ): boolean {
    if (operation === Operations.And) {
      return compositeFilters.every((compositeFilter) =>
        this.filterRecursively(row, compositeFilter)
      );
    }
    return compositeFilters.some((compositeFilter) =>
      this.filterRecursively(row, compositeFilter)
    );
  }

  private applyFilters(): number[] {
    const indexes = [];
    const dataDict = this.getDataDict(this.modelType);
    for (const [index, row] of dataDict.entries()) {
      if (this.filterRow(row, this.filters)) {
        if (this.compositeFilters.length > 0) {
          if (
            this.filterComposite(row, this.compositeFilters, Operations.And)
          ) {
            indexes.push(index);
          }
        } else {
          indexes.push(index);
        }
      }
    }
    return indexes;
  }

  private getDataDict(
    modelType?: ModelTypes
  ): Array<{ [key: string]: unknown }> {
    const dataDict = Array.from({ length: this.dataset.features.length }).map(
      (_, index) => {
        const dict = {};
        dict[DatasetCohortColumns.Index] = index;
        return dict;
      }
    );
    this.dataset.features.forEach((row, index) => {
      row.forEach((val, colIndex) => {
        const featureName = this.dataset.feature_names[colIndex];
        dataDict[index][featureName] = val;
      });
    });
    this.dataset.true_y.forEach((val, index) => {
      if (Array.isArray(val)) {
        val.forEach((subVal, subIndex) => {
          dataDict[index][DatasetCohortColumns.TrueY + subIndex.toString()] =
            subVal;
        });
      } else {
        dataDict[index][DatasetCohortColumns.TrueY] = val;
      }
    });
    this.dataset.predicted_y?.forEach((val, index) => {
      if (Array.isArray(val)) {
        val.forEach((subVal, subIndex) => {
          dataDict[index][
            DatasetCohortColumns.PredictedY + subIndex.toString()
          ] = subVal;
        });
      } else {
        dataDict[index][DatasetCohortColumns.PredictedY] = val;
      }
    });
    // set up errors
    if (modelType === ModelTypes.Regression) {
      for (const [index, row] of dataDict.entries()) {
        dataDict[index][DatasetCohortColumns.RegressionError] = Math.abs(
          row[DatasetCohortColumns.TrueY] - row[DatasetCohortColumns.PredictedY]
        );
      }
    } else if (modelType && IsBinary(modelType)) {
      // sum pred and 2*true to map to ints 0 - 3,
      // 0: TN
      // 1: FP
      // 2: FN
      // 3: TP
      for (const [index, row] of dataDict.entries()) {
        dataDict[index][DatasetCohortColumns.ClassificationError] =
          2 * row[DatasetCohortColumns.TrueY] +
          row[DatasetCohortColumns.PredictedY];
      }
    } else if (modelType && IsMulticlass(modelType)) {
      for (const [index, row] of dataDict.entries()) {
        dataDict[index][DatasetCohortColumns.ClassificationError] =
          row[DatasetCohortColumns.TrueY] !==
          row[DatasetCohortColumns.PredictedY]
            ? MulticlassClassificationEnum.Misclassified
            : MulticlassClassificationEnum.Correct;
      }
    }
    return dataDict;
  }

  private filterRow(
    row: { [key: string]: unknown },
    filters: IFilter[]
  ): boolean {
    return filters.every((filter) => {
      const rowVal = row[filter.column];
      switch (filter.method) {
        case FilterMethods.Equal:
          return rowVal === filter.arg[0];
        case FilterMethods.GreaterThan:
          return typeof rowVal == "number" && rowVal > filter.arg[0];
        case FilterMethods.GreaterThanEqualTo:
          return typeof rowVal == "number" && rowVal >= filter.arg[0];
        case FilterMethods.LessThan:
          return typeof rowVal == "number" && rowVal < filter.arg[0];
        case FilterMethods.LessThanEqualTo:
          return typeof rowVal == "number" && rowVal <= filter.arg[0];
        case FilterMethods.Includes:
          return this.includesValue(filter, rowVal);
        case FilterMethods.Excludes:
          return !this.includesValue(filter, rowVal);
        case FilterMethods.InTheRangeOf:
          return (
            typeof rowVal == "number" &&
            rowVal >= filter.arg[0] &&
            rowVal <= filter.arg[1]
          );
        default:
          return false;
      }
    });
  }

  private includesValue(filter: IFilter, val: unknown): boolean {
    if (
      this.columnRanges &&
      (this.columnRanges[filter.column]?.rangeType === RangeTypes.Categorical ||
        this.columnRanges[filter.column].treatAsCategorical)
    ) {
      if (
        filter.column === DatasetCohortColumns.PredictedY ||
        filter.column === DatasetCohortColumns.TrueY ||
        filter.column === DatasetCohortColumns.ClassificationError
      ) {
        return filter.arg.includes(val as number);
      }
      const uniqueValues = this.columnRanges[filter.column].sortedUniqueValues;
      const index = uniqueValues.findIndex((item) => item === val);
      return filter.arg.includes(index);
    }
    return false;
  }

  private updateStatsFromData(): ErrorCohortStats {
    let totalAll = 0;
    let totalCohort = 0;
    let totalCorrect = 0;
    let totalCohortCorrect = 0;
    let totalIncorrect = 0;
    let totalCohortIncorrect = 0;
    let errorRate = 0;

    const trueYsCohort = getPropertyValues(
      this.selectedIndexes,
      DatasetCohortColumns.TrueY,
      this.dataset
    );
    const predYsCohort = getPropertyValues(
      this.selectedIndexes,
      DatasetCohortColumns.PredictedY,
      this.dataset
    );
    const indexes = [...new Array(this.dataset.features.length).keys()];
    const trueYs = getPropertyValues(
      indexes,
      DatasetCohortColumns.TrueY,
      this.dataset
    );
    const predYs = getPropertyValues(
      indexes,
      DatasetCohortColumns.PredictedY,
      this.dataset
    );

    if (trueYsCohort && trueYs && predYsCohort && predYs) {
      totalCohort = trueYsCohort.length;
      totalAll = trueYs.length;

      for (let i = 0; i < totalAll; i++) {
        totalCorrect += trueYs[i] === predYs[i] ? 1 : 0;
      }
      totalIncorrect = totalAll - totalCorrect;

      for (let i = 0; i < totalCohort; i++) {
        totalCohortCorrect += trueYsCohort[i] === predYsCohort[i] ? 1 : 0;
      }
      totalCohortIncorrect = totalCohort - totalCohortCorrect;
    }
    // Calculate error rate
    if (totalCohort === 0) {
      errorRate = 0;
    } else {
      errorRate = (totalCohortIncorrect / totalCohort) * 100;
    }
    return new ErrorCohortStats(
      totalCohortIncorrect,
      totalCohort,
      totalIncorrect,
      totalAll,
      errorRate,
      Metrics.ErrorRate
    );
  }
}
