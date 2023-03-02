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
  // The if-condition below should always be true since these are all required
  // for forecasting and validated upon building the model assessment context.
  // The if statement exists merely to satisfy the compiler.
  if (
    featureMetaData &&
    featureMetaData.datetime_features &&
    featureMetaData.datetime_features?.length > 0
  ) {
    const isDatetimeFeature =
      featureMetaData.datetime_features[0] === featureName;
    const isTimeSeriesIdColumn =
      featureMetaData.time_series_id_features?.includes(featureName) ?? false;
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
