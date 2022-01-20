// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

export enum ErrorBarType {
  Area = "area",
  Scatter = "scatter",
  Line = "line"
}

export function getErrorBarChartType(
  fill?: string,
  yLength?: number
): ErrorBarType {
  if (fill) {
    return ErrorBarType.Area;
  }
  return yLength === 1 ? ErrorBarType.Scatter : ErrorBarType.Line;
}
