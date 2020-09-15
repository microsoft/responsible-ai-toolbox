// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { RangeTypes } from "./RangeTypes";

export interface ICategoricalRange {
  uniqueValues: string[];
  rangeType: RangeTypes.Categorical;
}
