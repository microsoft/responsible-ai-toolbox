// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  IFilter,
  ICompositeFilter,
  FilterMethods
} from "../Interfaces/IFilter";
import { JointDataset, IJointMeta } from "../util/JointDataset";

import { Cohort, CohortSource } from "./Cohort";
import { MetricCohortStats, ErrorCohortStats } from "./CohortStats";
import { Metrics } from "./Constants";

export class ErrorCohort {
  public cohortStats: MetricCohortStats;
  public metricValue: number;
  public metricName: string;
  public constructor(
    public cohort: Cohort,
    public jointDataset: JointDataset,
    public cells: number = 0,
    public source: CohortSource = CohortSource.None,
    public isTemporary: boolean = false,
    cohortStats: MetricCohortStats | undefined = undefined
  ) {
    this.cohort = cohort;
    this.jointDataset = jointDataset;
    this.metricValue = 0;
    if (cohortStats) {
      this.cohortStats = cohortStats;
      this.metricValue = cohortStats.metricValue;
      this.metricName = cohortStats.metricName;
    } else {
      cohort.sort();
      const filteredData = cohort.filteredData;
      this.cohortStats = this.updateStatsFromData(filteredData, jointDataset);
      this.metricValue = this.cohortStats.metricValue;
      this.metricName = this.cohortStats.metricName;
    }
  }

  public static getDataFilters(
    filters: IFilter[],
    features: string[]
  ): IFilter[] {
    // return the filters relabeled from original label to Data#
    const filtersRelabeled = filters.map(
      (filter: IFilter): IFilter => {
        const index = features.indexOf(filter.column);
        const key = JointDataset.DataLabelRoot + index.toString();
        return {
          arg: filter.arg,
          column: key,
          method: filter.method
        };
      }
    );
    return filtersRelabeled;
  }

  public static getLabeledFilters(
    filters: IFilter[],
    jointDataset: JointDataset
  ): IFilter[] {
    // return the filters relabeled from Data# to original label
    const filtersRelabeled = filters.map(
      (filter: IFilter): IFilter => {
        const label = jointDataset.metaDict[filter.column].label;
        return {
          arg: filter.arg,
          column: label,
          method: filter.method
        };
      }
    );
    return filtersRelabeled;
  }

  public static getLabeledCompositeFilters(
    compositeFilters: ICompositeFilter[],
    jointDataset: JointDataset
  ): ICompositeFilter[] {
    // return the filters relabeled from Data# to original label
    const filtersRelabeled = compositeFilters.map(
      (compositeFilter: ICompositeFilter): ICompositeFilter => {
        if (compositeFilter.method) {
          return ErrorCohort.getLabeledFilters(
            [compositeFilter as IFilter],
            jointDataset
          )[0] as ICompositeFilter;
        }
        return {
          compositeFilters: ErrorCohort.getLabeledCompositeFilters(
            compositeFilter.compositeFilters,
            jointDataset
          ),
          operation: compositeFilter.operation
        } as ICompositeFilter;
      }
    );
    return filtersRelabeled;
  }

  public cohortFiltersToString(filters: IFilter[]): string[] {
    return filters.map((filter: IFilter): string => {
      let method = "";
      const metaDict = this.jointDataset.metaDict[filter.column];
      const label = metaDict.label;
      if (filter.method === FilterMethods.InTheRangeOf) {
        const arg0 = filter.arg[0].toFixed(2);
        const arg1 = filter.arg[1].toFixed(2);
        return `${label} in (${arg0}, ${arg1}]`;
      }
      if (filter.method === FilterMethods.Includes) {
        const args = this.getFilterBoundsArgs(metaDict, filter);
        return `${label} in ${args}`;
      }
      if (filter.method === FilterMethods.Excludes) {
        const args = this.getFilterBoundsArgs(metaDict, filter);
        return `${label} not in ${args}`;
      }
      if (filter.method === FilterMethods.Equal) {
        method = "==";
        if (metaDict.treatAsCategorical && metaDict.sortedCategoricalValues) {
          const catArg = (metaDict.sortedCategoricalValues as string[])[
            filter.arg[0]
          ];
          return `${label} ${method} ${catArg}`;
        }
      } else if (filter.method === FilterMethods.GreaterThan) {
        method = ">";
      } else if (filter.method === FilterMethods.GreaterThanEqualTo) {
        method = ">=";
      } else if (filter.method === FilterMethods.LessThan) {
        method = "<";
      } else if (filter.method === FilterMethods.LessThanEqualTo) {
        method = "<=";
      }
      return `${label} ${method} ${filter.arg[0].toFixed(2)}`;
    });
  }

  public cohortCompositeFiltersToString(
    compositeFilters: ICompositeFilter[]
  ): string[] {
    return compositeFilters.map((compositeFilter: ICompositeFilter): string => {
      if (compositeFilter.method) {
        return this.cohortFiltersToString([compositeFilter as IFilter])[0];
      }
      const cohortCompositeFiltersStrings = this.cohortCompositeFiltersToString(
        compositeFilter.compositeFilters
      );
      if (cohortCompositeFiltersStrings.length === 1) {
        return cohortCompositeFiltersStrings[0];
      }
      return cohortCompositeFiltersStrings
        .map(
          (cohortCompositeFiltersString) => `(${cohortCompositeFiltersString})`
        )
        .join(` ${compositeFilter.operation} `);
    });
  }

  public filtersToString(): string[] {
    const cohortFilters = this.cohortFiltersToString(this.cohort.filters);
    const cohortCompositeFilters = this.cohortCompositeFiltersToString(
      this.cohort.compositeFilters
    );
    return cohortFilters.concat(cohortCompositeFilters);
  }

  private getFilterBoundsArgs(metaDict: IJointMeta, filter: IFilter): string {
    if (metaDict.treatAsCategorical && metaDict.sortedCategoricalValues) {
      return filter.arg
        .map((arg) => (metaDict.sortedCategoricalValues as string[])[arg])
        .join(", ");
    }
    return filter.arg.map((arg) => arg.toFixed(2)).join(", ");
  }

  private updateStatsFromData(
    filteredData: Array<{ [key: string]: number }>,
    jointDataset: JointDataset
  ): ErrorCohortStats {
    // Calculate various cohort and global stats
    const trueYsCohort = JointDataset.unwrap(
      filteredData,
      JointDataset.TrueYLabel
    );
    const predYsCohort = JointDataset.unwrap(
      filteredData,
      JointDataset.PredictedYLabel
    );

    const trueYs = jointDataset.unwrap(JointDataset.TrueYLabel);
    const predYs = jointDataset.unwrap(JointDataset.PredictedYLabel);
    let totalAll = 0;
    let totalCohort = 0;
    let totalCorrect = 0;
    let totalCohortCorrect = 0;
    let totalIncorrect = 0;
    let totalCohortIncorrect = 0;
    let errorRate = 0;

    if (trueYsCohort && trueYs && predYsCohort && predYs) {
      totalCohort = trueYsCohort.length;
      totalAll = trueYs.length;

      for (let i = 0; i < totalAll; i++) {
        totalCorrect += trueYs[i] === predYs[i] ? 1 : 0;
      }
      totalIncorrect = totalAll - totalCorrect;

      totalCohortCorrect = 0;
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
