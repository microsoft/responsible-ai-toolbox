// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Chart, IChartElement } from "./Chart";

const dReg = /^M([\d.]+),0A(\1),(\1) 0 1,1 0,-(\1)A(\1),(\1) 0 0,1 (\1),0Z$/;
const transformReg = /^translate\(([\d.]+),([\d.]+)\)$/;

export interface IScatter extends IChartElement {
  readonly radius: number;
}
export class ScatterChart extends Chart<IScatter> {
  public get Elements(): IScatter[] {
    return this.getHtmlElements(".trace.scatter:eq(0) .points path").map(
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
    cy.get(`${this.container} .nsewdrag.drag`).trigger("mousedown", {
      clientX: offset.left,
      clientY: offset.top,
      eventConstructor: "MouseEvent",
      force: true
    });
    cy.document().then((doc) => {
      const event = new MouseEvent("mouseup", {
        bubbles: true,
        clientX: offset.left,
        clientY: offset.top
      });
      doc.dispatchEvent(event);
    });
  }

  private getNthPointOffset(idx: number): JQuery.Coordinates | undefined {
    return cy.$$(`.trace.scatter:eq(0) .points path:eq(${idx})`).offset();
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
    const [radius] = strCords.map((s) => Number(s));
    const transform = element.getAttribute("transform");
    if (!transform) {
      throw new Error(
        `${idx}th path element in svg does not have "transform" attribute`
      );
    }
    const transformExec = transformReg.exec(transform);
    if (!transformExec) {
      throw new Error(
        `${idx}th path element in svg have invalid "transform" attribute ${transform}`
      );
    }
    const [, ...strTransforms] = transformExec;
    const [x, y] = strTransforms.map((s) => Number(s));
    return {
      bottom: y + radius,
      left: x - radius,
      radius,
      right: x + radius,
      top: y - radius
    };
  };
}
