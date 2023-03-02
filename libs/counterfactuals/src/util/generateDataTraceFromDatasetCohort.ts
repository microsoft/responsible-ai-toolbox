// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  DatasetCohort,
  getPropertyValues,
  IGenericChartProps
} from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";
import { IData } from "@responsible-ai/mlchartlib";
import { Dictionary } from "lodash";

export function generateDataTraceFromDatasetCohort(
  chartProps: IGenericChartProps,
  trace: IData,
  datasetCohort?: DatasetCohort
): void {
  if (!datasetCohort) {
    return;
  }
  const indexes = datasetCohort.selectedIndexes;
  const customdata = indexes.map((val) => {
    const dict: Dictionary<unknown> = {};
    dict[DatasetCohort.Index] = val;
    return dict;
  });
  let hovertemplate = "{point.customdata.Index}<br>";
  if (chartProps.xAxis) {
    const isCategorical = datasetCohort.dataset.categorical_features.includes(
      chartProps.xAxis.property
    );
    const rawX = getPropertyValues(
      indexes,
      chartProps.xAxis.property,
      datasetCohort.dataset,
      datasetCohort.modelTypes
    );
    // TODO(Ruby): localize chartProps.xAxis.property
    hovertemplate += `${chartProps.xAxis.property}: {point.customdata.X}<br>`;
    rawX.forEach((val, index) => {
      customdata[index].X = isCategorical
        ? val
        : (val as number).toLocaleString(undefined, {
            maximumSignificantDigits: 5
          });
    });
    // TODO(Ruby): add dither
    trace.x = rawX;
  }

  if (chartProps.yAxis) {
    const isCategorical = datasetCohort.dataset.categorical_features.includes(
      chartProps.yAxis.property
    );
    const rawY = getPropertyValues(
      indexes,
      chartProps.yAxis.property,
      datasetCohort.dataset,
      datasetCohort.modelTypes
    );
    hovertemplate += `${chartProps.yAxis.property}: {point.customdata.Y}<br>`;
    rawY.forEach((val, index) => {
      customdata[index].Y = isCategorical
        ? val
        : (val as number).toLocaleString(undefined, {
            maximumSignificantDigits: 5
          });
    });
    // TODO(Ruby): add dither
    trace.y = rawY;
  }

  if (datasetCohort.dataset.feature_metadata) {
    const identityFeatureName =
      datasetCohort.dataset.feature_metadata.identity_feature_name;
    if (identityFeatureName) {
      const isCategorical =
        datasetCohort.dataset.categorical_features.includes(
          identityFeatureName
        );
      const rawIdentityFeature = getPropertyValues(
        indexes,
        identityFeatureName,
        datasetCohort.dataset,
        datasetCohort.modelTypes
      );
      hovertemplate += `${localization.Common.identityFeature} (${identityFeatureName}): {point.customdata.ID}<br>`;
      rawIdentityFeature.forEach((val, index) => {
        customdata[index].ID = isCategorical
          ? val
          : (val as number).toLocaleString(undefined, {
              maximumSignificantDigits: 5
            });
      });
    }
  }

  hovertemplate += `${localization.Interpret.Charts.rowIndex}: {point.customdata.Index}<br>`;
  hovertemplate += "<extra></extra>";
  trace.customdata = customdata as any;
  trace.hovertemplate = hovertemplate;
}
