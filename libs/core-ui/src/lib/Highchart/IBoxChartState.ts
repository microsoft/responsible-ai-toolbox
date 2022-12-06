// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IHighchartBoxData } from "../Interfaces/IHighchartBoxData";

export interface IBoxChartState {
  boxPlotData: Array<IHighchartBoxData | undefined>;
  outlierData: number[][] | undefined;
}
