// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { ICohort, ICompositeFilter } from "@responsible-ai/core-ui";

export enum IOperation {
  Multiply = "multiply",
  Add = "add",
  Subtract = "subtract",
  Divide = "divide"
}

interface IForecastCohort extends ICohort {
  compositeFilterList: ICompositeFilter[];
}

export interface ITransformation {
  cohort: IForecastCohort;
  operation: IOperation;
  feature: string;
  value: number;
}
