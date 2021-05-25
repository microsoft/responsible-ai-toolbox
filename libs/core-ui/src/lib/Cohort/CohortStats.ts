// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export class BaseCohortStats {
  public totalAll = 0;
  public totalCohort = 0;
  public errorCoverage = 0;
  public constructor(
    totalCount: number,
    baseTotalCount: number,
    errorCoverage: number
  ) {
    this.totalAll = baseTotalCount;
    this.totalCohort = totalCount;
    this.errorCoverage = errorCoverage;
  }
}

/**
 * Contains basic cohort metric statistics.
 */
export class MetricCohortStats extends BaseCohortStats {
  public metricValue = 0;
  public metricName: string;
  public constructor(
    totalCount: number,
    baseTotalCount: number,
    metricValue: number,
    metricName: string,
    errorCoverage: number
  ) {
    super(totalCount, baseTotalCount, errorCoverage);
    this.metricValue = metricValue;
    this.metricName = metricName;
  }
}

/**
 * Contains additional error information for classification scenario
 * such as the number of correct or incorrect instances.
 */
export class ErrorCohortStats extends MetricCohortStats {
  public totalCorrect = 0;
  public totalCohortCorrect = 0;
  public totalIncorrect = 0;
  public totalCohortIncorrect = 0;
  public constructor(
    numError: number,
    totalCount: number,
    baseNumError: number,
    baseTotalCount: number,
    metricValue: number,
    metricName: string
  ) {
    super(
      totalCount,
      baseTotalCount,
      metricValue,
      metricName,
      (numError / baseNumError) * 100
    );
    this.totalCohortCorrect = totalCount - numError;
    this.totalCohortIncorrect = numError;
    this.totalCorrect = baseTotalCount - baseNumError;
    this.totalIncorrect = baseNumError;
  }
}
