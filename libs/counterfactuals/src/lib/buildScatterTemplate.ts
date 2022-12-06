// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IGenericChartProps, JointDataset } from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";

export interface ICustomData {
  AbsoluteIndex?: number;
  Color?: number;
  Index?: number;
  template?: string;
}

export function buildScatterTemplate(
  jointData: JointDataset,
  chartProps: IGenericChartProps,
  x: any,
  y: any,
  index: any,
  absoluteIndex: any
): ICustomData {
  let hovertemplate = "";
  let customData: ICustomData = {};
  const xName = jointData.metaDict[chartProps.xAxis.property].label;
  const yName = jointData.metaDict[chartProps.yAxis.property].label;
  if (chartProps.xAxis) {
    hovertemplate += `${xName}: ${x}<br>`;
  }
  if (chartProps.yAxis) {
    hovertemplate += `${yName}: ${y}<br>`;
  }
  // if (jointData.datasetMetaData?.featureMetaData) {
  //   const identityFeatureName =
  //     jointData.datasetMetaData.featureMetaData?.identity_feature_name;

  //   if (identityFeatureName) {
  //     const jointDatasetFeatureName =
  //       jointData.getJointDatasetFeatureName(identityFeatureName);

  //     if (jointDatasetFeatureName) {
  //       hovertemplate += `${localization.Common.identityFeature} (${identityFeatureName}): ${customData.ID}<br>`;
  //     }
  //   }
  // }
  if (chartProps.colorAxis) {
    hovertemplate += `${
      jointData.metaDict[chartProps.colorAxis.property].label
    }: ${customData.Color}<br>`;
  }
  hovertemplate += `${localization.Interpret.Charts.rowIndex}: ${index}<br>`;
  customData.template = hovertemplate;
  customData.AbsoluteIndex = absoluteIndex;
  customData.Index = index;
  // customData.Color = 0;
  return customData;
}
