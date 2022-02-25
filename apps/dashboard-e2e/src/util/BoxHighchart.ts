// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Chart, IChartElement } from "./Chart";

// const boxReg =
//   /^M([\d.]+),([\d.]+)H([\d.]+)M([\d.]+),([\d.]+)H([\d.]+)V([\d.]+)H([\d.]+)ZM([\d.]+),([\d.]+)V([\d.]+)M([\d.]+),([\d.]+)V([\d.]+)M([\d.]+),([\d.]+)H([\d.]+)M([\d.]+),([\d.]+)H([\d.]+)$/;
// const meanReg = /^M([\d.]+),([\d.]+)H([\d.]+)$/;

export interface IBoxHighchart extends IChartElement {
  readonly q1?: number;
  readonly q2?: number;
  readonly q3?: number;
  readonly mean?: number;
}
export class BoxHighchart extends Chart<IBoxHighchart> {
  public get Elements(): any {
    const boxElements = this.getBoxElements();
    return boxElements;
  }

  private getBoxElements(): HTMLElement[] {
    return this.getHighChartHtmlElements("g.highcharts-point");
  }
}
