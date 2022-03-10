// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as Highcharts from "highcharts";
import data from "highcharts/modules/data";
import exportData from "highcharts/modules/export-data";
import heatmap from "highcharts/modules/heatmap";

import { HighchartsModuleNames } from "./HighchartTypes";

// tslint:disable-next-line: export-name
export async function loadModules(
  modules: HighchartsModuleNames[]
): Promise<void> {
  for (const m of modules) {
    if (m === "data") {
      data(Highcharts);
    } else if (m === "export-data") {
      exportData(Highcharts);
    } else if (m === "heatmap") {
      heatmap(Highcharts);
    }
  }
}
