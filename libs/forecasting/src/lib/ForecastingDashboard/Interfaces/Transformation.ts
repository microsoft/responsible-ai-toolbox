// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { ErrorCohort } from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";

export type Operation = {
  key: string;
  displayName: string;
  minValue: number;
  maxValue: number;
  excludedValues: number[];
};

export function isMultiplicationOrDivision(operation: Operation): boolean {
  return ["multiply", "divide"].includes(operation.key);
}

export const transformationOperations: Operation[] = [
  {
    displayName: localization.Forecasting.Transformations.multiply,
    excludedValues: [0, 1],
    key: "multiply",
    maxValue: 1000,
    minValue: -1000
  },
  {
    displayName: localization.Forecasting.Transformations.divide,
    excludedValues: [0, 1],
    key: "divide",
    maxValue: 1000,
    minValue: -1000
  },
  {
    displayName: localization.Forecasting.Transformations.add,
    excludedValues: [0],
    key: "add",
    maxValue: 1000,
    minValue: -1000
  },
  {
    displayName: localization.Forecasting.Transformations.subtract,
    excludedValues: [0],
    key: "subtract",
    maxValue: 1000,
    minValue: -1000
  },
];

export type Feature = {
  key: string;
  text: string;
};

export class Transformation {
  public cohort: ErrorCohort;
  public operation: Operation;
  public feature: Feature;
  public value: number;

  public constructor(
    cohort: ErrorCohort,
    operation: Operation,
    feature: Feature,
    value: number
  ) {
    this.cohort = cohort;
    this.operation = operation;
    this.feature = feature;
    this.value = value;
  }

  public equals(obj: Transformation): boolean {
    return (
      this.cohort.cohort.getCohortID() === obj.cohort.cohort.getCohortID() &&
      this.operation.key === obj.operation.key &&
      this.feature.key === obj.feature.key &&
      this.value === obj.value
    );
  }
}
