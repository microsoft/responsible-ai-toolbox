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
  compareObjects(newProps, oldProps, changedKeys);
}

function compareObjects(
  newProps: object,
  oldProps: object,
  changedKeys: string[]
): void {
  for (const key of Object.keys(newProps)) {
    const newValue: unknown = Reflect.get(newProps, key);
    const oldValue: unknown = Reflect.get(oldProps, key);
    if (
      typeof newValue === "object" &&
      newValue !== null &&
      typeof oldValue === "object" &&
      oldValue !== null
    ) {
      compareObjects(newValue, oldValue, changedKeys);
    }
    if (newValue !== oldValue) {
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
