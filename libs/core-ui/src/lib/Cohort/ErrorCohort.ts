// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IFilter, ICompositeFilter, FilterMethods } from "../Interfaces/IFilter";
import { JointDataset, IJointMeta } from "../util/JointDataset";
import { Cohort, ErrorDetectorCohortSource } from "./Cohort";
import { CohortStats } from "./CohortStats";

export class ErrorCohort {
  public totalAll = 0;
  public totalCohort = 0;
  public totalCorrect = 0;
  public totalCohortCorrect = 0;
  public totalIncorrect = 0;
  public totalCohortIncorrect = 0;
  public errorRate = 0;
  public errorCoverage = 0;
  public constructor(
    public cohort: Cohort,
    public jointDataset: JointDataset,
    public cells: number = 0,
    public source: ErrorDetectorCohortSource = ErrorDetectorCohortSource.None,
    public isTemporary: boolean = false,
    public cohortStats: CohortStats | undefined = undefined
  ) {
    this.cohort = cohort;
    this.jointDataset = jointDataset;
    if (cohortStats) {
      this.errorCoverage = cohortStats.errorCoverage;
      this.errorRate = cohortStats.errorRate;
      this.totalAll = cohortStats.totalAll;
      this.totalCorrect = cohortStats.totalCorrect;
      this.totalIncorrect = cohortStats.totalIncorrect;
      this.totalCohort = cohortStats.totalCohort;
      this.totalCohortCorrect = cohortStats.totalCohortCorrect;
      this.totalCohortIncorrect = cohortStats.totalCohortIncorrect;
    } else {
      cohort.sort();
      const filteredData = cohort.filteredData;
      this.updateStatsFromData(filteredData, jointDataset);
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
  ): void {
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

    if (trueYsCohort && trueYs && predYsCohort && predYs) {
      this.totalCohort = trueYsCohort.length;
      this.totalAll = trueYs.length;

      for (let i = 0; i < this.totalAll; i++) {
        this.totalCorrect += trueYs[i] === predYs[i] ? 1 : 0;
      }
      this.totalIncorrect = this.totalAll - this.totalCorrect;

      this.totalCohortCorrect = 0;
      for (let i = 0; i < this.totalCohort; i++) {
        this.totalCohortCorrect += trueYsCohort[i] === predYsCohort[i] ? 1 : 0;
      }
      this.totalCohortIncorrect = this.totalCohort - this.totalCohortCorrect;
    }
    // Calculate error rate
    if (this.totalCohort === 0) {
      this.errorRate = 0;
    } else {
      this.errorRate = (this.totalCohortIncorrect / this.totalCohort) * 100;
    }
    // Calculate error coverage
    if (this.totalIncorrect === 0) {
      this.errorCoverage = 0;
    } else {
      this.errorCoverage =
        (this.totalCohortIncorrect / this.totalIncorrect) * 100;
    }
  }
}
