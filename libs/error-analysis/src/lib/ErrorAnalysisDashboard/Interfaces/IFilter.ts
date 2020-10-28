// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export enum FilterMethods {
  GreaterThan = "greater",
  GreaterThanEqualTo = "greater and equal",
  LessThan = "less",
  LessThanEqualTo = "less and equal",
  Equal = "equal",
  Includes = "includes",
  InTheRangeOf = "in the range of"
}

export interface IFilter {
  method: FilterMethods;
  arg: number[];
  column: string;
}

export interface IFilterContext {
  filters: IFilter[];
  onAdd: (newFilter: IFilter) => void;
  onDelete: (index: number) => void;
  onUpdate: (filter: IFilter, index: number) => void;
}
