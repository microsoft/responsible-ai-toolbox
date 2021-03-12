// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export class CohortStats {
  public totalAll = 0;
  public totalCohort = 0;
  public totalCorrect = 0;
  public totalCohortCorrect = 0;
  public totalIncorrect = 0;
  public totalCohortIncorrect = 0;
  public errorRate = 0;
  public errorCoverage = 0;
  public constructor(
    numError: number,
    totalCount: number,
    baseNumError: number,
    baseTotalCount: number,
    errorRate: number
  ) {
    this.totalCohortCorrect = totalCount - numError;
    this.totalCohortIncorrect = numError;
    this.totalCohort = totalCount;
    this.errorCoverage = (this.totalCohortIncorrect / baseNumError) * 100;
    this.errorRate = errorRate;
    this.totalAll = baseTotalCount;
    this.totalCorrect = baseTotalCount - baseNumError;
    this.totalIncorrect = baseNumError;
  }
}
