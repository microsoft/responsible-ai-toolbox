// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IFeatureMetaData } from "../Interfaces/IMetaData";

export function orderByTime(
  values: number[],
  rowIndices: string[]
): Array<[number, number]> {
  return values
    .map((predictedValue: number, idx: number) => {
      return [Date.parse(rowIndices[idx]), predictedValue] as [number, number];
    })
    .sort(
      (objA: [number, number], objB: [number, number]) => objA[0] - objB[1]
    );
}

export function isTimeOrTimeSeriesIDColumn(
  featureName: string,
  featureMetaData?: IFeatureMetaData
): boolean {
  if (featureMetaData) {
    const isDatetimeFeature = featureMetaData.time_column_name === featureName;
    const isTimeSeriesIdColumn =
      featureMetaData.time_series_id_column_names?.includes(featureName) ??
      false;
    return isDatetimeFeature || isTimeSeriesIdColumn;
  }
  // If we don't have feature metadata then we can assume that there are no
  // time or time series identifying columns.
  return false;
}

export function featureColumnsExist(
  featureNames: string[],
  featureMetaData?: IFeatureMetaData
): boolean {
  if (featureNames.length === 0) {
    return false;
  }
  if (featureMetaData === undefined) {
    // features exist but none of them are time or time series id columns
    return true;
  }
  return (
    featureNames.filter(
      (featureName) => !isTimeOrTimeSeriesIDColumn(featureName, featureMetaData)
    ).length > 0
  );
}
