// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Chart } from "./Chart";

const boxReg = /M([\d.]+),([\d.]+)H([\d.]+)M([\d.]+),([\d.]+)H([\d.]+)V([\d.]+)H([\d.]+)ZM([\d.]+),([\d.]+)V([\d.]+)M([\d.]+),([\d.]+)V([\d.]+)M([\d.]+),([\d.]+)H([\d.]+)M([\d.]+),([\d.]+)H([\d.]+)/;
const meanReg = /M([\d.]+),([\d.]+)H([\d.]+)/;

export interface IBox {
  readonly left: number;
  readonly right: number;
  readonly bottom: number;
  readonly q1: number;
  readonly q2: number;
  readonly q3: number;
  readonly top: number;
  readonly mean: number;
}
export class BoxChart extends Chart<IBox> {
  public get Elements(): IBox[] {
    const boxElements = this.getBoxElements();
    const meanElements = this.getMeanElements();
    const pointElements = this.getPointElements();
    if (boxElements.length !== meanElements.length) {
      throw new Error(
        `boxElements: ${boxElements.length} does not match meanElements: ${meanElements.length}`
      );
    }
    if (boxElements.length !== pointElements.length) {
      throw new Error(
        `boxElements: ${boxElements.length} does not match pointElements: ${pointElements.length}`
      );
    }
    return boxElements.map((b, i) => this.getCoordinate(i, b, meanElements[i]));
  }
  private readonly getCoordinate = (
    idx: number,
    boxElement: HTMLElement,
    meanElement: HTMLElement
  ): IBox => {
    const boxCoordinate = this.getBoxCoordinate(idx, boxElement);
    const meanCoordinate = this.getMeanCoordinate(idx, meanElement);
    if (boxCoordinate.left !== meanCoordinate.left) {
      throw new Error(
        `left for box: ${boxCoordinate.left} does not match left for mean: ${meanCoordinate.left} `
      );
    }
    if (boxCoordinate.right !== meanCoordinate.right) {
      throw new Error(
        `right for box: ${boxCoordinate.right} does not match right for mean: ${meanCoordinate.right} `
      );
    }
    if (boxCoordinate.bottom < meanCoordinate.mean) {
      throw new Error(
        `mean: ${meanCoordinate.mean} is out of bottom: ${boxCoordinate.bottom} `
      );
    }
    if (boxCoordinate.top > meanCoordinate.mean) {
      throw new Error(
        `mean: ${meanCoordinate.mean} is out of top: ${boxCoordinate.top} `
      );
    }
    return {
      ...boxCoordinate,
      ...meanCoordinate
    };
  };

  private readonly getBoxCoordinate = (
    idx: number,
    boxElement: HTMLElement
  ): Pick<IBox, "left" | "right" | "q1" | "q2" | "q3" | "top" | "bottom"> => {
    const d = boxElement.getAttribute("d");
    if (!d) {
      throw new Error(
        `${idx}th path element in svg does not have "d" attribute`
      );
    }
    const exec = boxReg.exec(d);
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
      center,
      q12,
      bottom,
      center2,
      q32,
      top,
      sLeft,
      bottom2,
      sRight,
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
    if (center !== center2) {
      throw new Error(`center: ${center}, ${center2} do not match`);
    }
    if (sLeft !== sLeft2) {
      throw new Error(`sleft: ${sLeft}, ${sLeft2} do not match`);
    }
    if (sRight !== sRight2) {
      throw new Error(`sright: ${sRight}, ${sRight2} do not match`);
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
    if (Math.round(((left + right) / 2) * 100) / 100 !== center) {
      throw new Error(
        `center: ${center}, is not in the middle of left: ${left} and right ${right}`
      );
    }
    if (Math.round(((sLeft + sRight) / 2) * 100) / 100 !== center) {
      throw new Error(
        `center: ${center}, is not in the middle of sLeft: ${sLeft} and right ${sRight}`
      );
    }
    return { left, right, bottom, q1, q2, q3, top };
  };

  private readonly getMeanCoordinate = (
    idx: number,
    meanElement: HTMLElement
  ): Pick<IBox, "left" | "right" | "mean"> => {
    const d = meanElement.getAttribute("d");
    if (!d) {
      throw new Error(
        `${idx}th path element in svg does not have "d" attribute`
      );
    }
    const exec = meanReg.exec(d);
    if (!exec) {
      throw new Error(
        `${idx}th path element in svg have invalid "d" attribute`
      );
    }
    const [, ...strCords] = exec;
    const [left, mean, right] = strCords.map((s) => Number(s));
    return { left, right, mean };
  };

  private getBoxElements(): HTMLElement[] {
    return cy.$$(`${this.container} svg .plot .trace.boxes > path.box`).get();
  }

  private getMeanElements(): HTMLElement[] {
    console.log(`${this.container} svg .plot .trace.boxes > path.mean`);
    return cy.$$(`${this.container} svg .plot .trace.boxes > path.mean`).get();
  }

  private getPointElements(): HTMLElement[] {
    return cy.$$(`${this.container} svg .plot .trace.boxes > g.points`).get();
  }
}
