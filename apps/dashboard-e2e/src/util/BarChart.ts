// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Chart, IChartElement } from "./Chart";

const cordReg = /^M([\d.]+),([\d.]+)V([\d.]+)H([\d.]+)V([\d.]+)Z$/;

export class BarChart extends Chart<IChartElement> {
  public get Elements(): IChartElement[] {
    return cy
      .$$(`${this.container} svg .plot .trace.bars .points .point path`)
      .get()
      .map((b, i) => this.getCoordinate(b, i));
  }

  public sortByH(): IChartElement[] {
    return this.Elements.sort((a, b) => a.top - b.top);
  }

  private readonly getCoordinate = (
    element: HTMLElement,
    idx: number
  ): IChartElement => {
    const d = element.getAttribute("d");
    if (!d) {
      throw new Error(
        `${idx}th path element in svg does not have "d" attribute`
      );
    }
    const exec = cordReg.exec(d);
    if (!exec) {
      throw new Error(
        `${idx}th path element in svg have invalid "d" attribute`
      );
    }
    const [, ...strCords] = exec;
    const [left, bottom, top, right, bottom2] = strCords.map((s) => Number(s));
    if (bottom !== bottom2) {
      throw new Error(`${idx}th path element in svg is not a rectangle`);
    }
    return { bottom, left, right, top };
  };
}
