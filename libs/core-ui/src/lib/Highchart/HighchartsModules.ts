// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as Highcharts from "highcharts";

import { HighchartsModuleNames } from "./HighchartTypes";

// tslint:disable-next-line: export-name
export async function loadModules(
  modules: HighchartsModuleNames[]
): Promise<void[]> {
  const modulePromises: Array<Promise<void>> = [];

  for (const m of modules) {
    if (m === "heatmap") {
      modulePromises.push(
        import("highcharts/modules/heatmap").then((hm) => {
          hm.default(Highcharts);
        })
      );
    }
  }

  return Promise.all(modulePromises);
}
