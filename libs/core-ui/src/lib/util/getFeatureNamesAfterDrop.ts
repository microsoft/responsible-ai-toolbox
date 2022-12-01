// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export function getFeatureNamesAfterDrop(
  originalFeatureNames: string[],
  droppedFeatures?: string[]
): string[] {
  let featureNames = originalFeatureNames;
  if (droppedFeatures) {
    featureNames = originalFeatureNames.filter(
      (name) => !droppedFeatures?.includes(name)
    );
  }
  return featureNames;
}
