// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Config, Layout } from "plotly.js";

import { IData } from "./IData";

export interface IPlotlyProperty {
  layout?: Partial<Layout>;
  config?: Partial<Config>;
  data: IData[];
}
