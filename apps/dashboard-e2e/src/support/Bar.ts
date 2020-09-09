const cordReg = /M([\d.]+),([\d.]+)V([\d.]+)H([\d.]+)V([\d.]+)Z/;

function getCoordinate(element: HTMLElement): Bar | undefined {
  const d = element.getAttribute("d");
  if (!d) {
    return undefined;
  }
  const exec = cordReg.exec(d);
  if (!exec) {
    return undefined;
  }
  const [, ...strCords] = exec;
  const [left, bottom, top, right, bottom2] = strCords.map(Number);
  if (bottom !== bottom2) {
    return undefined;
  }
  return new Bar(left, bottom, right - left, bottom - top);
}
export class Bar {
  public constructor(
    public x: number,
    public y: number,
    public w: number,
    public h: number
  ) {
    return;
  }
  public static getCoordinates(
    barElements: JQuery<HTMLElement>
  ): Array<Bar | undefined> {
    return barElements.get().map(getCoordinate);
  }

  public static sortByX(bars: Array<Bar | undefined>): Array<Bar | undefined> {
    return Bar.sort(bars, (b) => b.x);
  }

  public static sortByH(bars: Array<Bar | undefined>): Array<Bar | undefined> {
    return Bar.sort(bars, (b) => b.h);
  }

  public static sort(
    bars: Array<Bar | undefined>,
    selector: (bar: Bar) => number
  ): Array<Bar | undefined> {
    return bars.sort((a: Bar | undefined, b: Bar | undefined): number => {
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
}
