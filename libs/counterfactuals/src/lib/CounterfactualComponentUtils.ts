// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

enum FieldChangeUpdate {
  Dither = "dither",
  Property = "property",
  Type = "type"
}

export function isJustTypeChange(changedKeys: string[]): boolean {
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

function removeItemAll(changedKeys: string[]): string[] {
  const valuesToRemove = new Set(["options", "xAxis", "yAxis"]); //Since chartProps is a nested object, these are parent keys which are usually changed if inner keys are changed.
  return changedKeys.filter((item) => !valuesToRemove.has(item));
}
