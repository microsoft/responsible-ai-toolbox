// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IGenericChartProps } from "@responsible-ai/core-ui";
import _ from "lodash";

export function isJustTypeChange_bkp(
  newProps: IGenericChartProps,
  prevProps?: IGenericChartProps
) {
  // if property, dither has changed - bubble chart
  // if only type has changed - update scatter plot
  const hasPropertyChanged = !_.isEqual(
    prevProps?.xAxis.property,
    newProps.xAxis.property
  );
  const hasDitherChanged = !_.isEqual(
    prevProps?.xAxis.options.dither,
    newProps.xAxis.options.dither
  );
  const hasTypeChanged = !_.isEqual(prevProps?.xAxis.type, newProps.xAxis.type);
  return (
    hasTypeChanged === true &&
    hasPropertyChanged === false &&
    hasDitherChanged === false
  );
}

enum FieldChangeUpdate {
  Dither = "dither",
  Property = "property",
  Type = "type"
}

export function isJustTypeChange(changedKeys: string[]) {
  // return true if only type of the axis has changed in panel
  const changedKeysTemp = removeItemAll(changedKeys);
  if (
    changedKeysTemp.length === 1 &&
    changedKeysTemp.includes(FieldChangeUpdate.Type)
  ) {
    return true;
  }
  return false;
}

function removeItemAll(changedKeys: string[]) {
  const valuesToRemove = new Set(["options", "xAxis", "yAxis"]);

  const res = changedKeys.filter((item) => !valuesToRemove.has(item));
  return res;
}
