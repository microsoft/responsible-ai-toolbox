// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { PlotData, BoxPlotData, ViolinData } from "plotly.js";

import { IAccessor } from "./IAccessor";

export type Data =
  | Partial<PlotData>
  | Partial<BoxPlotData>
  | Partial<ViolinData>;

export type IData = Data & {
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
};
