export const enum FilterMethods {
  greaterThan = "greater",
  greaterThanEqualTo = "greater and equal",
  lessThan = "less",
  lessThanEqualTo = "less and equal",
  equal = "equal",
  includes = "includes",
  inTheRangeOf = "in the range of"
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
