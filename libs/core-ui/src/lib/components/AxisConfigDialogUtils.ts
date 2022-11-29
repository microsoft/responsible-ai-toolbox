// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { localization } from "@responsible-ai/localization";

import { JointDataset } from "../util/JointDataset";
import { ColumnCategories, IJointMeta } from "../util/JointDatasetUtils";

export interface IAxisValueDescription {
  minDescription: string;
  maxDescription: string;
  categoricalDescription: string;
}

export function metaDescription(metaVal: IJointMeta): IAxisValueDescription {
  const minVal = getMinValue(metaVal);
  const maxVal = getMaxValue(metaVal);
  const minDescription = localization.formatString(
    localization.Interpret.Filters.min,
    minVal
  );
  const maxDescription = localization.formatString(
    localization.Interpret.Filters.max,
    maxVal
  );
  const categoricalDescription = localization.formatString(
    localization.Interpret.Filters.uniqueValues,
    metaVal?.sortedCategoricalValues?.length
  );
  return { categoricalDescription, maxDescription, minDescription };
}

export function getMinValue(selectedMeta: IJointMeta): number | string {
  if (selectedMeta?.treatAsCategorical || !selectedMeta?.featureRange) {
    return 0;
  }
  if (Number.isInteger(selectedMeta.featureRange.min)) {
    return selectedMeta.featureRange.min;
  }
  return (Math.round(selectedMeta.featureRange.min * 10000) / 10000).toFixed(4);
}

export function getMaxValue(selectedMeta: IJointMeta): number | string {
  if (selectedMeta?.treatAsCategorical || !selectedMeta?.featureRange) {
    return 0;
  }
  if (Number.isInteger(selectedMeta.featureRange.max)) {
    return selectedMeta.featureRange.max;
  }
  return (Math.round(selectedMeta.featureRange.max * 10000) / 10000).toFixed(4);
}

export function extractSelectionKey(key: string): string {
  if (key === undefined) {
    return ColumnCategories.None;
  }
  if (key.includes(JointDataset.DataLabelRoot)) {
    return JointDataset.DataLabelRoot;
  }
  if (key.includes(JointDataset.ProbabilityYRoot)) {
    return JointDataset.ProbabilityYRoot;
  }
  return key;
}

export function allowUserInteract(propertyName: string): boolean {
  return propertyName !== JointDataset.IndexLabel;
}

export function getBinCountForProperty(
  selectedMeta: IJointMeta,
  canBin: boolean,
  defaultBinCount: number
): number | undefined {
  let binCount = undefined;
  if (canBin && !selectedMeta?.treatAsCategorical) {
    binCount =
      selectedMeta.sortedCategoricalValues !== undefined
        ? selectedMeta.sortedCategoricalValues.length
        : defaultBinCount;
  }
  return binCount;
}
