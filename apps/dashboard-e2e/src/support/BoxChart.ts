// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Chart } from "./Chart";

const cordReg = /M([\d.]+),([\d.]+)H([\d.]+)M([\d.]+),([\d.]+)H([\d.]+)V([\d.]+)H([\d.]+)ZM([\d.]+),([\d.]+)V([\d.]+)M([\d.]+),([\d.]+)V([\d.]+)M([\d.]+),([\d.]+)H([\d.]+)M([\d.]+),([\d.]+)H([\d.]+)/;

export interface IBox {
  readonly left: number;
  readonly right: number;
  readonly bottom: number;
  readonly q1: number;
  readonly q2: number;
  readonly q3: number;
  readonly top: number;
}
export class BoxChart extends Chart<IBox> {
  public get Elements(): IBox[] {
    return cy
      .$$(`${this.container} svg .plot .trace.boxes > path.box`)
      .get()
      .map((b, i) => this.getCoordinate(b, i));
  }

  private readonly getCoordinate = (
    element: HTMLElement,
    idx: number
  ): IBox => {
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
    const [
      left,
      q2,
      right,
      left2,
      q1,
      right2,
      q3,
      left3,
      center1,
      q12,
      bottom,
      center2,
      q32,
      top,
      sLeft1,
      bottom2,
      sRight1,
      sLeft2,
      top2,
      sRight2
    ] = strCords.map((s) => Number(s));
    if (left !== left2 || left2 !== left3) {
      throw new Error(`left: ${left}, ${left2}, ${left3} do not match`);
    }
    if (right !== right2) {
      throw new Error(`right: ${right}, ${right2} do not match`);
    }
    if (bottom !== bottom2) {
      throw new Error(`bottom: ${bottom}, ${bottom2} do not match`);
    }
    if (q1 !== q12) {
      throw new Error(`q1: ${q1}, ${q12} do not match`);
    }
    if (q3 !== q32) {
      throw new Error(`q3: ${q3}, ${q32} do not match`);
    }
    if (top !== top2) {
      throw new Error(`top: ${top}, ${top2} do not match`);
    }
    if (q1 !== q12) {
      throw new Error(`q1: ${q1}, ${q12} do not match`);
    }
    if (center1 !== center2) {
      throw new Error(`center: ${center1}, ${center2} do not match`);
    }
    if (sLeft1 !== sLeft2) {
      throw new Error(`sleft: ${sLeft1}, ${sLeft2} do not match`);
    }
    if (sRight1 !== sRight2) {
      throw new Error(`sright: ${sRight1}, ${sRight2} do not match`);
    }
    if (q1 > bottom) {
      throw new Error(`q1: ${q1} is greater than bottom: ${bottom} `);
    }
    if (q2 > q1) {
      throw new Error(`q1: ${q2} is greater than q1: ${q1} `);
    }
    if (q3 > q2) {
      throw new Error(`q1: ${q3} is greater than q2: ${q2} `);
    }
    if (top > q3) {
      throw new Error(`top: ${top} is greater than q3: ${q3} `);
    }
    return { left, right, bottom, q1, q2, q3, top };
  };
}
