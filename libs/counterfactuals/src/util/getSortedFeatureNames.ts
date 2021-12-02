// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { ICounterfactualData } from "@responsible-ai/core-ui";

import { ILocalImportanceData } from "../lib/LocalImportanceChart";

export function getSortedFeatureNames(
  data: ICounterfactualData | undefined,
  selectedIndex: number,
  sortFeatures: boolean
): string[] {
  const tempData: ILocalImportanceData[] = [];
  const localImportanceData = data?.local_importance?.[selectedIndex];
  if (!localImportanceData || !sortFeatures) {
    return data?.feature_names_including_target || [];
  }
  data?.feature_names_including_target.forEach((f: string, index: number) => {
    tempData.push({
      label: f,
      value: localImportanceData[index] || -Infinity
    });
  });
  tempData.sort(
    (d1: ILocalImportanceData, d2: ILocalImportanceData) => d2.value - d1.value
  );
  const result = tempData.map((p) => p.label);
  return result;
}
