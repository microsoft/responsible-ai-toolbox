// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  Cohort,
  JointDataset,
  IFilter,
  FilterMethods
} from "@responsible-ai/interpret";

export class ErrorCohort {
  public totalAll = 0;
  public totalCohort = 0;
  public totalCorrect = 0;
  public totalCohortCorrect = 0;
  public totalIncorrect = 0;
  public totalCohortIncorrect = 0;
  public errorRate = 0;
  public errorCoverage = 0;
  public constructor(public cohort: Cohort, public jointDataset: JointDataset) {
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
    this.errorRate = this.totalCohortIncorrect / this.totalCohort;
    // Calculate error coverage
    this.errorCoverage =
      (this.totalCohortIncorrect / this.totalIncorrect) * 100;
  }

  public filtersToString(): string[] {
    return this.cohort.filters.map((filter: IFilter): string => {
      let method = "";
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
      const label = this.jointDataset.metaDict[filter.column].label;
      return `${label} ${method} ${filter.arg[0].toFixed(2)}`;
    });
  }
}
