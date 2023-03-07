// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  ICategoricalRange,
  INumericRange,
  RangeTypes
} from "@responsible-ai/mlchartlib";
import _ from "lodash";

import { ErrorCohortStats, MetricCohortStats } from "./Cohort/CohortStats";
import { CohortSource, Metrics } from "./Cohort/Constants";
import { IDataset } from "./Interfaces/IDataset";
import { ModelTypes } from "./Interfaces/IExplanationContext";
import { FilterMethods, IFilter } from "./Interfaces/IFilter";
import { getPropertyValues } from "./util/datasetUtils/getPropertyValues";
import { IsBinary, IsMulticlass } from "./util/ExplanationUtils";
import { MulticlassClassificationEnum } from "./util/JointDatasetUtils";

export class DatasetCohort {
  public static readonly Index = "Index";
  public static readonly Dataset = "Dataset";
  public static readonly PredictedY = "Predicted Y";
  public static readonly TrueY = "True Y";
  public static readonly ClassificationError = "Classification outcome";
  public static readonly RegressionError = "Regression error";
  public static readonly ProbabilityY = "Probability Y";

  public selectedIndexes: number[] = [];
  public cohortStats: MetricCohortStats;
  public constructor(
    public name: string,
    public dataset: IDataset,
    public filters: IFilter[] = [],
    public modelTypes?: ModelTypes,
    private featureRanges?: {
      [key: string]: INumericRange | ICategoricalRange;
    },
    public source: CohortSource = CohortSource.None,
    public isTemporary: boolean = false,
    cohortStats: MetricCohortStats | undefined = undefined
  ) {
    this.name = name;
    this.selectedIndexes = this.applyFilters();
    if (cohortStats) {
      this.cohortStats = cohortStats;
    } else {
      this.cohortStats = this.updateStatsFromData();
    }
  }

  private applyFilters(): number[] {
    const indexes = [];
    const dataDict = this.getDataDict(this.modelTypes);
    for (const [index, row] of dataDict.entries()) {
      if (this.filterRow(row, this.filters)) {
        indexes.push(index);
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
        dict[DatasetCohort.Index] = index;
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
          dataDict[index][DatasetCohort.TrueY + subIndex.toString()] = subVal;
        });
      } else {
        dataDict[index][DatasetCohort.TrueY] = val;
      }
    });
    this.dataset.predicted_y?.forEach((val, index) => {
      if (Array.isArray(val)) {
        val.forEach((subVal, subIndex) => {
          dataDict[index][DatasetCohort.PredictedY + subIndex.toString()] =
            subVal;
        });
      } else {
        dataDict[index][DatasetCohort.PredictedY] = val;
      }
    });
    // set up errors
    console.log(modelType);
    if (modelType === ModelTypes.Regression) {
      for (const [index, row] of dataDict.entries()) {
        dataDict[index][DatasetCohort.RegressionError] = Math.abs(
          row[DatasetCohort.TrueY] - row[DatasetCohort.PredictedY]
        );
      }
    } else if (modelType && IsBinary(modelType)) {
      // sum pred and 2*true to map to ints 0 - 3,
      // 0: TN
      // 1: FP
      // 2: FN
      // 3: TP
      for (const [index, row] of dataDict.entries()) {
        dataDict[index][DatasetCohort.ClassificationError] =
          2 * row[DatasetCohort.TrueY] + row[DatasetCohort.PredictedY];
      }
    } else if (modelType && IsMulticlass(modelType)) {
      for (const [index, row] of dataDict.entries()) {
        dataDict[index][DatasetCohort.ClassificationError] =
          row[DatasetCohort.TrueY] !== row[DatasetCohort.PredictedY]
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
      this.featureRanges &&
      this.featureRanges[filter.column]?.rangeType === RangeTypes.Categorical
    ) {
      if (
        filter.column === DatasetCohort.PredictedY ||
        filter.column === DatasetCohort.TrueY ||
        filter.column === DatasetCohort.ClassificationError
      ) {
        return filter.arg.includes(val as number);
      }
      const uniqueValues = (
        this.featureRanges[filter.column] as ICategoricalRange
      ).uniqueValues;
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
      DatasetCohort.TrueY,
      this.dataset
    );
    const predYsCohort = getPropertyValues(
      this.selectedIndexes,
      DatasetCohort.PredictedY,
      this.dataset
    );
    const indexes = [...new Array(this.dataset.features.length).keys()];
    const trueYs = getPropertyValues(
      indexes,
      DatasetCohort.TrueY,
      this.dataset
    );
    const predYs = getPropertyValues(
      indexes,
      DatasetCohort.PredictedY,
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
