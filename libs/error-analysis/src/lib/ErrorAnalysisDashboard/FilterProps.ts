// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export class FilterProps {
  public numCorrect: number;
  public numIncorrect: number;
  public errorCoverage: number;
  public metricName: string;
  public metricValue: number;
  public totalCount: number;
  public constructor(
    numError: number,
    totalCount: number,
    baseNumError: number,
    metricName: string,
    metricValue: number
  ) {
    this.numCorrect = totalCount - numError;
    this.numIncorrect = numError;
    this.errorCoverage = (this.numIncorrect / baseNumError) * 100;
    this.metricName = metricName;
    this.metricValue = metricValue;
    this.totalCount = totalCount;
  }
}
