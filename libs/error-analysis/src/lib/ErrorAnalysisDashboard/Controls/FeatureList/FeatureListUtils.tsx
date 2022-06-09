// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IColumn } from "@fluentui/react";
import { ITableState } from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";

export function updateItems(
  percents: number[],
  sortedFeatures: string[],
  searchedFeatures: string[],
  isEnabled: boolean
): ITableState {
  const rows: any = [];
  searchedFeatures.forEach((feature) => {
    const sortedFeatureIndex = sortedFeatures.indexOf(feature);
    const row = [feature, percents[sortedFeatureIndex]];
    rows.push(row);
  });
  const columns: IColumn[] = [];
  if (!isEnabled) {
    columns.push({
      fieldName: "0",
      isResizable: false,
      key: "checkbox",
      maxWidth: 15,
      minWidth: 15,
      name: ""
    });
  }
  columns.push({
    fieldName: "0",
    isResizable: true,
    key: "features",
    maxWidth: 60,
    minWidth: 40,
    name: localization.ErrorAnalysis.FeatureList.features
  });
  columns.push({
    fieldName: "1",
    isResizable: true,
    key: "importances",
    maxWidth: 100,
    minWidth: 50,
    name: localization.ErrorAnalysis.FeatureList.importances
  });
  return {
    columns,
    rows
  };
}

export function updatePercents(importances: number[]): number[] {
  let percents: number[] = [];
  if (importances && importances.length > 0) {
    const maxImportance = importances.reduce(
      (featImp1: number, featImp2: number) => Math.max(featImp1, featImp2)
    );
    percents = importances.map((imp: number) => (imp / maxImportance) * 100);
  }
  return percents;
}

export function sortByPercent(
  percents: number[],
  features: string[]
): [number[], string[]] {
  let sortedPercents: number[] = [];
  let sortedFeatures: string[] = features;
  // Sort the searched features by importance
  if (percents.length > 0) {
    let joinedFeatImp: Array<[number, string]> = [];
    joinedFeatImp = percents.map((percent, i) => [percent, features[i]]);
    joinedFeatImp.sort(function (left, right) {
      return left[0] > right[0] ? -1 : 1;
    });
    sortedPercents = joinedFeatImp.map((joinedVal) => joinedVal[0]);
    sortedFeatures = joinedFeatImp.map((joinedVal) => joinedVal[1]);
  }
  return [sortedPercents, sortedFeatures];
}
