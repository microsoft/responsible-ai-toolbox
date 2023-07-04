// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { RangeTypes } from "./RangeTypes";

// create IColumnRange interface to include both categorical and numerical scenario
// so when column is numerical, we not only save min and max
// but also save the corresponding sortedUniqueValues,
// so when user set as categorical back and forth
// we will be able to get numerical and categorical values directly
export interface IColumnRange {
  rangeType: RangeTypes.Integer | RangeTypes.Numeric | RangeTypes.Categorical;
  min?: number;
  max?: number;
  sortedUniqueValues: unknown[];
  // used to allow user to treat integers as categorical (but switch back as convenient...)
  treatAsCategorical?: boolean;
}
