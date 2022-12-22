// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { ErrorCohort } from "@responsible-ai/core-ui";

export type Operation = {
  key: string;
  displayName: string;
  minValue: number;
  maxValue: number;
  excludedValues: number[];
};

export function isMultiplicationOrDivision(operation: Operation) {
  return ["multiply", "divide"].includes(operation.key);
}

export const transformationOperations: Operation[] = [
  {
    key: "multiply",
    displayName: "Multiply",
    minValue: -1000,
    maxValue: 1000,
    excludedValues: [0, 1]
  },
  {
    key: "divide",
    displayName: "Divide",
    minValue: -1000,
    maxValue: 1000,
    excludedValues: [0, 1]
  },
  {
    key: "add",
    displayName: "Add",
    minValue: -1000,
    maxValue: 1000,
    excludedValues: [0]
  },
  {
    key: "subtract",
    displayName: "Subtract",
    minValue: -1000,
    maxValue: 1000,
    excludedValues: [0]
  }
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

  constructor(
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
