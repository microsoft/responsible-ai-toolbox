// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Chart, IChartElement } from "./Chart";

const dReg = /^M ([\d.]+) ([\d.]+) A 4 4 0 1 1 ([\d.]+) ([\d.]+) Z$/;
export interface IScatter extends IChartElement {
  readonly x?: number;
  readonly y1?: number;
  readonly y2?: number;
  readonly y3?: number;
}

export class ScatterChartErrorBars extends Chart<IScatter> {
  public get Elements(): IScatter[] {
    return this.getHighChartHtmlElements("path").map((b, i) =>
      this.getCoordinate(b, i)
    );
  }

  public sortByH(): IScatter[] {
    return this.Elements.sort((a, b) => a.top - b.top);
  }
  // This has to be updated
  public clickNthPoint(idx: number): void {
    const offset = this.getNthPointOffset(idx);
    if (!offset) {
      return;
    }
    cy.get(
      `${this.container} svg g.highcharts-series-group > g[class*='highcharts-tracker'] path`
    ).trigger("mouseover", {
      clientX: offset.left,
      clientY: offset.top - 70,
      eventConstructor: "MouseEvent",
      force: true
    });
    cy.document().then((doc) => {
      const event = new MouseEvent("mouseover", {
        bubbles: true,
        clientX: offset.left,
        clientY: offset.top
      });
      doc.dispatchEvent(event);
    });
  }

  // This has to be updated
  private getNthPointOffset(idx: number): JQuery.Coordinates | undefined {
    return cy
      .$$(
        `${this.container} svg g.highcharts-series-group > g[class*='highcharts-tracker'] path:eq(${idx})`
      )
      .offset();
  }

  private readonly getCoordinate = (
    element: HTMLElement,
    idx: number
  ): IScatter => {
    const d = element.getAttribute("d");
    if (!d) {
      throw new Error(
        `${idx}th path element in svg does not have "d" attribute`
      );
    }
    const exec = dReg.exec(d);
    if (!exec) {
      throw new Error(
        `${idx}th path element in svg have invalid "d" attribute`
      );
    }
    const [, ...strCords] = exec;
    const [x, y1, horTip, vertTip, yChange, height] = strCords.map((s) =>
      Number(s)
    );
    if (horTip === vertTip) {
      throw new Error("Horizontal tip is equal to vertical length");
    }
    return {
      bottom: x, // x
      left: y1, // y1
      right: yChange, // y2
      top: height // y3
    };
  };
}
