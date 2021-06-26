// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Data } from "plotly.js";

import { IAccessor } from "./IAccessor";

export interface IData extends Data {
  xAccessor?: string;
  xAccessorLB?: string;
  xAccessorUB?: string;
  xAccessorPrefix?: string;
  yAccessor?: string;
  yAccessorLB?: string;
  yAccessorUB?: string;
  yAccessorPrefix?: string;
  groupBy?: string[];
  groupByPrefix?: string;
  sizeAccessor?: string;
  maxMarkerSize?: number;
  seriesLevelAccessors?: { [key: string]: IAccessor };
  datapointLevelAccessors?: { [key: string]: IAccessor };
}
