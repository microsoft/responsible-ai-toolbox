// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IGenericChartProps } from "../../util/IGenericChartProps";

enum FieldChangeUpdate {
  Dither = "dither",
  Property = "property",
  Type = "type"
}

export interface IClusterData {
  x?: number;
  y?: number;
  indexSeries: number[];
  xSeries: number[];
  ySeries: number[];
  xMap?: { [key: number]: string };
  yMap?: { [key: number]: string };
}

export function getInitialClusterState(): IClusterData {
  return {
    indexSeries: [],
    x: undefined,
    xSeries: [],
    y: undefined,
    ySeries: []
  };
}

export function hasAxisTypeChanged(changedKeys: string[]): boolean {
  // return true only if type of the axis has changed in panel
  const changedKeysTemp = removeParentKeys(changedKeys);
  return (
    changedKeysTemp.length === 1 &&
    changedKeysTemp.includes(FieldChangeUpdate.Type)
  );
}

function removeParentKeys(changedKeys: string[]): string[] {
  const valuesToRemove = new Set(["options", "xAxis", "yAxis", "colorAxis"]); // Since chartProps is a nested object, these are parent keys which are usually changed if inner keys are changed.
  return changedKeys.filter((item) => !valuesToRemove.has(item));
}

export function compareChartProps(
  newProps: IGenericChartProps,
  oldProps: IGenericChartProps,
  changedKeys: string[]
): void {
  for (const key in newProps) {
    if (typeof newProps[key] === "object") {
      compareChartProps(newProps[key], oldProps[key], changedKeys);
    }
    if (newProps[key] !== oldProps[key]) {
      changedKeys.push(key);
    }
  }
}

export function hasAxisTypeUpdated(
  changedKeys: string[],
  prevChartProps?: IGenericChartProps,
  currentChartProps?: IGenericChartProps
): boolean {
  if (currentChartProps && prevChartProps) {
    changedKeys = [];
    compareChartProps(prevChartProps, currentChartProps, changedKeys);
    return hasAxisTypeChanged(changedKeys);
  }
  return false;
}
