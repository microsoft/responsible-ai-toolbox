// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Chart, IChartElement } from "./Chart";

export class BarHighchart extends Chart<IChartElement> {
  public get Elements(): any[] {
    return this.getHighChartBarElements("g.highcharts-series-group");
  }

  public sortByH(): IChartElement[] {
    return this.Elements.sort((a, b) => a.top - b.top);
  }
}
