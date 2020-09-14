// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { RangeTypes } from "./RangeTypes";

export interface INumericRange {
  // if the feature is numeric
  min: number;
  max: number;
  rangeType: RangeTypes.Integer | RangeTypes.Numeric;
}
