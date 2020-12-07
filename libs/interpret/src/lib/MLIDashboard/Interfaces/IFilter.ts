// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export enum FilterMethods {
  GreaterThan = "greater",
  GreaterThanEqualTo = "greater and equal",
  LessThan = "less",
  LessThanEqualTo = "less and equal",
  Equal = "equal",
  Includes = "includes",
  Excludes = "excludes",
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

export enum Operations {
  And = "and",
  Or = "or"
}

export type ICompositeFilter =
  | IFilter
  | {
      compositeFilters: ICompositeFilter[];
      operation: Operations;

      method?: never;
    };
