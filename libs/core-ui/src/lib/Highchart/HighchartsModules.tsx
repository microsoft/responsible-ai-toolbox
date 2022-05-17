// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as Highcharts from "highcharts";
import gantt from "highcharts/modules/gantt";
import heatmap from "highcharts/modules/heatmap";
import PatternFillModule from "highcharts/modules/pattern-fill";

import { HighchartsModuleNames } from "./HighchartTypes";

// tslint:disable-next-line: export-name
export async function loadModules(
  modules: HighchartsModuleNames[]
): Promise<void> {
  for (const m of modules) {
    if (m === "heatmap") {
      heatmap(Highcharts);
    }
    if (m === "gantt") {
      gantt(Highcharts);
    }
    if (m === "pattern-fill") {
      PatternFillModule(Highcharts);
    }
  }
}
