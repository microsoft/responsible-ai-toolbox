// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { localization } from "@responsible-ai/localization";
import _, { Dictionary } from "lodash";

import { Cohort } from "../Cohort/Cohort";

import { IDependenceData } from "./getDependencyChartOptions";
import { IGenericChartProps } from "./IGenericChartProps";
import { JointDataset } from "./JointDataset";

export function getDependenceData(
  chartProps: IGenericChartProps | undefined,
  jointData: JointDataset,
  cohort: Cohort
): IDependenceData[] {
  if (!chartProps) {
    return [];
  }
  if (
    chartProps.colorAxis &&
    (chartProps.colorAxis.options.bin ||
      jointData.metaDict[chartProps.colorAxis.property]?.treatAsCategorical)
  ) {
    cohort.sort(chartProps.colorAxis.property);
  }
  let xData: number[] = [];
  let yData: number[] = [];

  const customData = cohort.unwrap(JointDataset.IndexLabel).map((val) => {
    const dict: Dictionary<any> = {};
    dict[JointDataset.IndexLabel] = val;
    return dict;
  });
  if (chartProps.xAxis) {
    const rawX = cohort.unwrap(chartProps.xAxis.property);
    const xLabel = jointData.metaDict[chartProps.xAxis.property].label;
    if (chartProps.xAxis.options.dither) {
      const dithered = cohort.unwrap(JointDataset.DitherLabel);
      xData = dithered.map((dither, index) => {
        return rawX[index] + dither;
      });
      rawX.forEach((val, index) => {
        // If categorical, show string value in tooltip
        if (jointData.metaDict[chartProps.xAxis.property]?.treatAsCategorical) {
          customData[index].X =
            jointData.metaDict[
              chartProps.xAxis.property
            ].sortedCategoricalValues?.[val];
        } else {
          customData[index].X = val;
        }
        customData[index].template = `${xLabel}: ${customData[index].X}<br>`;
      });
    } else {
      xData = _.cloneDeep(rawX);
    }
  }
  if (chartProps.yAxis) {
    const yLabel = localization.Interpret.Charts.featureImportance;
    yData = cohort.unwrap(chartProps.yAxis.property);
    yData.forEach((val, index) => {
      customData[index].Yformatted = val.toLocaleString(undefined, {
        maximumFractionDigits: 3
      });
      customData[index].template = customData[index].template
        ? `${customData[index].template}${yLabel}: ${customData[index].Yformatted}<br>`
        : `${yLabel}: ${customData[index].Yformatted}<br>`;
    });
  }
  if (jointData.datasetMetaData?.featureMetaData) {
    const identityFeatureName =
      jointData.datasetMetaData.featureMetaData?.identity_feature_name;

    if (identityFeatureName) {
      const jointDatasetFeatureName =
        jointData.getJointDatasetFeatureName(identityFeatureName);

      if (jointDatasetFeatureName) {
        const rawIdentityFeatureData = cohort.unwrap(jointDatasetFeatureName);
        rawIdentityFeatureData.forEach((val, index) => {
          // If categorical, show string value in tooltip
          if (jointData.metaDict[jointDatasetFeatureName]?.treatAsCategorical) {
            customData[index].ID =
              jointData.metaDict[
                jointDatasetFeatureName
              ].sortedCategoricalValues?.[val];
          } else {
            customData[index].ID = val;
          }
          customData[
            index
          ].template += `${localization.Common.identityFeature} (${identityFeatureName}): ${customData[index].ID}<br>`;
        });
      }
    }
  }
  const indices = cohort.unwrap(JointDataset.IndexLabel, false);
  indices.forEach((absoluteIndex, i) => {
    customData[i].AbsoluteIndex = absoluteIndex;
    customData[
      i
    ].template += `${localization.Interpret.Charts.rowIndex}: ${absoluteIndex}<br>`;
    customData[i].template += "<extra></extra>";
  });
  const result = customData.map((d, index) => {
    return {
      customData: d,
      x: xData[index],
      y: yData[index]
    } as IDependenceData;
  });
  return result;
}
