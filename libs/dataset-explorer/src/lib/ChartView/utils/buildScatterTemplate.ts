// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IGenericChartProps, JointDataset } from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";

export function buildScatterTemplate(
  jointData: JointDataset,
  chartProps: IGenericChartProps,
  x: any,
  y: any,
  customData: any
): string {
  let hovertemplate = "";
  const xName = jointData.metaDict[chartProps.xAxis.property].label;
  const yName = jointData.metaDict[chartProps.yAxis.property].label;
  if (chartProps.xAxis) {
    if (chartProps.xAxis.options.dither) {
      hovertemplate += `${xName}: ${customData.X}<br>`;
    } else {
      hovertemplate += `${xName}: ${x}<br>`;
    }
  }
  if (chartProps.yAxis) {
    if (chartProps.yAxis.options.dither) {
      hovertemplate += `${yName}: ${customData.Y}<br>`;
    } else {
      hovertemplate += `${yName}: ${y}<br>`;
    }
  }
  if (jointData.datasetMetaData?.featureMetaData) {
    const identityFeatureName =
      jointData.datasetMetaData.featureMetaData?.identity_feature_name;

    if (identityFeatureName) {
      const jointDatasetFeatureName =
        jointData.getJointDatasetFeatureName(identityFeatureName);

      if (jointDatasetFeatureName) {
        hovertemplate += `${localization.Common.identityFeature} (${identityFeatureName}): ${customData.ID}<br>`;
      }
    }
  }
  if (chartProps.colorAxis) {
    hovertemplate += `${
      jointData.metaDict[chartProps.colorAxis.property].label
    }: ${customData.Color}<br>`;
  }
  hovertemplate += `${localization.Interpret.Charts.rowIndex}: ${customData.AbsoluteIndex}<br>`;
  customData.template = hovertemplate;
  return customData;
}
