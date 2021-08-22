// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Data } from "plotly.js";

import { IAccessor } from "./IAccessor";

export interface IData extends Data {
  xAccessor?: string;
  xAccessorLowerBound?: string;
  xAccessorUpperBound?: string;
  xAccessorPrefix?: string;
  yAccessor?: string;
  yAccessorLowerBound?: string;
  yAccessorUpperBound?: string;
  yAccessorPrefix?: string;
  groupBy?: string[];
  groupByPrefix?: string;
  sizeAccessor?: string;
  maxMarkerSize?: number;
  seriesLevelAccessors?: { [key: string]: IAccessor };
  datapointLevelAccessors?: { [key: string]: IAccessor };
}
