// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export enum ComparisonTypes {
  /**
   * (less than)
   */
  LT = "lt",
  /**
   * (less than or equal to)
   */
  LTE = "lte",
  /**
   * (greater than)
   */
  GT = "gt",
  /**
   * (greater than or equal to)
   */
  GTE = "gte",
  /**
   * (equal to)
   */
  EQ = "eq",
  /**
   * (not equal to)
   */
  NE = "ne",
  /**
   * (in the set)
   */
  IN = "in",
  /**
   * (not in the set)
   */
  NIN = "nin",
  /**
   * (int the range)
   */
  RG = "rg",
  /**
   * (not in the range)
   */
  NRG = "nrg"
}

export function flipComparisonType(
  type: ComparisonTypes
): ComparisonTypes | undefined {
  switch (type) {
    case ComparisonTypes.LT:
      return ComparisonTypes.GTE;
    case ComparisonTypes.LTE:
      return ComparisonTypes.GT;
    case ComparisonTypes.GT:
      return ComparisonTypes.LTE;
    case ComparisonTypes.GTE:
      return ComparisonTypes.LT;
    case ComparisonTypes.EQ:
      return ComparisonTypes.NE;
    case ComparisonTypes.NE:
      return ComparisonTypes.EQ;
    case ComparisonTypes.IN:
      return ComparisonTypes.NIN;
    case ComparisonTypes.NIN:
      return ComparisonTypes.IN;
    case ComparisonTypes.RG:
      return ComparisonTypes.NRG;
    case ComparisonTypes.NRG:
      return ComparisonTypes.RG;
    default:
      return undefined;
  }
}
