// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { RangeTypes } from "@responsible-ai/mlchartlib";

export interface IBinnedResponse {
  hasError: boolean;
  array: Array<number | string>;
  labelArray: string[];
  featureIndex: number;
  rangeType: RangeTypes;
}
