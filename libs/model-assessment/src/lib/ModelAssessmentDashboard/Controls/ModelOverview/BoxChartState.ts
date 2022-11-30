// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IHighchartBoxData } from "@responsible-ai/core-ui";


export interface IBoxChartState {
  boxPlotData: Array<IHighchartBoxData | undefined>;
  outlierData: number[][] | undefined;
}
