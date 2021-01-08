// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export class FilterProps {
  public numCorrect: number;
  public numIncorrect: number;
  public errorCoverage: number;
  public errorRate: number;
  public constructor(
    numError: number,
    totalCount: number,
    baseNumError: number,
    errorRate: number
  ) {
    this.numCorrect = totalCount - numError;
    this.numIncorrect = numError;
    this.errorCoverage = (this.numIncorrect / baseNumError) * 100;
    this.errorRate = errorRate;
  }
}
