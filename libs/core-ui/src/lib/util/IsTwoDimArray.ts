export function IsTwoDimArray(val: number[] | number[][]): val is number[][] {
  return val.some((v: number | number[]) => Array.isArray(v));
}
