// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

enum FieldChangeUpdate {
  Dither = "dither",
  Property = "property",
  Type = "type"
}

export function hasAxisTypeChanged(changedKeys: string[]): boolean {
  // return true only if type of the axis has changed in panel
  const changedKeysTemp = removeParentKeys(changedKeys);
  if (
    changedKeysTemp.length === 1 &&
    changedKeysTemp.includes(FieldChangeUpdate.Type)
  ) {
    return true;
  }
  return false;
}

function removeParentKeys(changedKeys: string[]): string[] {
  const valuesToRemove = new Set(["options", "xAxis", "yAxis"]); // Since chartProps is a nested object, these are parent keys which are usually changed if inner keys are changed.
  return changedKeys.filter((item) => !valuesToRemove.has(item));
}
