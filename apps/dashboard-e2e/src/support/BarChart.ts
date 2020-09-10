const cordReg = /M([\d.]+),([\d.]+)V([\d.]+)H([\d.]+)V([\d.]+)Z/;

export interface IBar {
  readonly x: number;
  readonly y: number;
  readonly w: number;
  readonly h: number;
}
export class BarChart {
  public constructor(public container: string) {
    return;
  }
  public get Bars(): Cypress.Chainable<Array<IBar | undefined>> {
    return cy
      .get(`${this.container} svg .plot .trace.bars .points .point path`)
      .then((e) => this.getCoordinates(e));
  }
  public get VisibleBars(): Cypress.Chainable<Array<IBar | undefined>> {
    const svgWidth = this.getSvgWidth() || 0;
    return this.Bars.then((bs) => {
      return bs.filter((bar) => (bar && bar.x + bar.w < svgWidth) || false);
    });
  }

  public static sortByX(
    bars: Array<IBar | undefined>
  ): Array<IBar | undefined> {
    return BarChart.sort(bars, (b) => b.x);
  }

  public static sortByH(
    bars: Array<IBar | undefined>
  ): Array<IBar | undefined> {
    return BarChart.sort(bars, (b) => b.h);
  }

  public static sort(
    bars: Array<IBar | undefined>,
    selector: (bar: IBar) => number
  ): Array<IBar | undefined> {
    return bars.sort((a: IBar | undefined, b: IBar | undefined): number => {
      if (a === b) {
        return 0;
      }
      if (a === undefined) {
        return -1;
      }
      if (b === undefined) {
        return 1;
      }
      return selector(a) - selector(b);
    });
  }

  private getSvgWidth(): number | undefined {
    return cy.$$("#FeatureImportanceBar svg").width();
  }

  private getCoordinates(
    barElements: JQuery<HTMLElement>
  ): Array<IBar | undefined> {
    return barElements.get().map((b) => this.getCoordinate(b));
  }

  private readonly getCoordinate = (element: HTMLElement): IBar | undefined => {
    const d = element.getAttribute("d");
    if (!d) {
      return undefined;
    }
    const exec = cordReg.exec(d);
    if (!exec) {
      return undefined;
    }
    const [, ...strCords] = exec;
    const [left, bottom, top, right, bottom2] = strCords.map((s) => Number(s));
    if (bottom !== bottom2) {
      return undefined;
    }
    return { x: left, y: bottom, w: right - left, h: bottom - top };
  };
}
