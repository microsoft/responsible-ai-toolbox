// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  Cohort,
  JointDataset,
  IFilter,
  FilterMethods,
  ICompositeFilter
} from "@responsible-ai/interpret";

export enum ErrorDetectorCohortSource {
  None = "None",
  TreeMap = "Tree Map",
  HeatMap = "Heat Map"
}

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
    public isTemporary: boolean = false
  ) {
    this.cohort = cohort;
    this.jointDataset = jointDataset;

    const filteredData = cohort.filteredData;
    // Calculate various cohort and global statistics
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

  public cohortFiltersToString(filters: IFilter[]): string[] {
    return filters.map((filter: IFilter): string => {
      let method = "";
      const label = this.jointDataset.metaDict[filter.column].label;
      if (filter.method === FilterMethods.InTheRangeOf) {
        const arg0 = filter.arg[0].toFixed(2);
        const arg1 = filter.arg[1].toFixed(2);
        return `${label} in (${arg0}, ${arg1}]`;
      }
      if (filter.method === FilterMethods.Equal) {
        method = "==";
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
}
