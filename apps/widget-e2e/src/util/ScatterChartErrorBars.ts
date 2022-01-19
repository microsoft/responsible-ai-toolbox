// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Chart, IChartElement } from "./Chart";

const dReg =
  /^M([\d.]+),([\d.]+)h([\d.]+)m-([\d.]+),([\d.]+)V([\d.]+)m-([\d.]+),([\d.]+)h([\d.]+)$/;

export interface IScatter extends IChartElement {
  readonly x?: number;
  readonly y1?: number;
  readonly y2?: number;
  readonly y3?: number;
}

export class ScatterChartErrorBars extends Chart<IScatter> {
  public get Elements(): IScatter[] {
    cy.task(
      "log",
      `scatterpoints: ${this.getHtmlElements(
        ".trace.scatter:eq(0) .errorbars path"
      ).map((b, i) => this.getCoordinate(b, i))}`
    );
    return this.getHtmlElements(".trace.scatter:eq(0) .errorbars path").map(
      (b, i) => this.getCoordinate(b, i)
    );
  }

  public sortByH(): IScatter[] {
    return this.Elements.sort((a, b) => a.top - b.top);
  }
  public clickNthPoint(idx: number): void {
    const offset = this.getNthPointOffset(idx);
    if (!offset) {
      return;
    }
    cy.get(`${this.container} .nsewdrag.drag`).trigger("mouseover", {
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

  private getNthPointOffset(idx: number): JQuery.Coordinates | undefined {
    return cy
      .$$(`${this.container} .trace.scatter:eq(0) .errorbars path:eq(${idx})`)
      .offset();
  }

  private readonly getCoordinate = (
    element: HTMLElement,
    idx: number
  ): IScatter => {
    cy.task("log", `element: ${element}`);
    console.log(`element:  ${element}\r\n`);

    const d = element.getAttribute("d");
    cy.task("log", `d: ${d}`);
    console.log(`d:  ${d}\r\n`);

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
      throw new Error(`Horizontal tip is equal to vertical length`);
    }
    cy.task("log", `return value: ${x}, ${y1}, ${yChange}, ${height}`);
    return {
      bottom: x, // x
      left: y1, // y1
      right: yChange, // y2
      top: height // y3
    };
  };
}
