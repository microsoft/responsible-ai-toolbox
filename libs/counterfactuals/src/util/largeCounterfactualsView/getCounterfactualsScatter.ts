// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  FluentUIStyles,
  IGenericChartProps,
  JointDataset
} from "@responsible-ai/core-ui";
import { WhatIfConstants } from "@responsible-ai/interpret";
import { localization } from "@responsible-ai/localization";
import { PointMarkerOptionsObject } from "highcharts";
import { Dictionary } from "lodash";

import { buildScatterTemplate } from "./buildScatterTemplate";

export interface IDatasetExplorerSeries {
  name?: string;
  color: any;
  data: IDatasetExplorerData[];
  marker?: PointMarkerOptionsObject;
}
export interface IDatasetExplorerData {
  x: number;
  y: number;
  customData: any;
  template: string | undefined;
}

export function getCounterfactualsScatter(
  xSeries: number[],
  ySeries: number[],
  indexSeries: number[],
  jointDataset: JointDataset,
  selectedPointsIndexes: number[],
  chartProps?: IGenericChartProps,
  customPoints?: Array<{ [key: string]: any }>
): any[] {
  const dataSeries: any = [];
  const result = [];
  // const customData = plotlyProps.data[0].customdata;
  const xData = xSeries;
  const yData = ySeries;

  if (yData) {
    yData.forEach((data, index) => {
      dataSeries.push({
        customData:
          chartProps &&
          buildScatterTemplate(
            jointDataset,
            chartProps,
            xData?.[index],
            data,
            index,
            indexSeries[index]
          ),
        marker: getMarker(selectedPointsIndexes, index),
        x: xData?.[index],
        y: data
      });
    });
  }

  dataSeries.map(
    (d: {
      customData: { Index: number };
      marker: { fillColor: string; radius: number; symbol: string };
    }) => {
      const selectionIndex = selectedPointsIndexes.indexOf(d.customData.Index);
      const color =
        selectionIndex === -1
          ? FluentUIStyles.fabricColorInactiveSeries
          : FluentUIStyles.fluentUIColorPalette[selectionIndex];
      return (d.marker = {
        fillColor: color,
        radius: 4,
        symbol: selectionIndex === -1 ? "circle" : "square"
      });
    }
  );

  if (customPoints) {
    const customPointsCustomData = getCustomPointCustomData(
      customPoints,
      jointDataset,
      chartProps
    );
    customPoints.forEach((_cp, index) => {
      dataSeries.push({
        customData: customPointsCustomData[index],
        marker: getCustomPointMarker(customPoints, index),
        x: customPointsCustomData[index].rawXValue,
        y: customPointsCustomData[index].rawYValue
      });
    });
  }

  result.push({
    data: dataSeries
  });
  return result;
}

function getMarker(selectedPointsIndexes: number[], index: number): any {
  const selectionIndex = selectedPointsIndexes.indexOf(index);
  const color =
    selectionIndex === -1
      ? FluentUIStyles.fabricColorInactiveSeries
      : FluentUIStyles.fluentUIColorPalette[selectionIndex];

  const marker = {
    fillColor: color,
    radius: 4,
    symbol: selectionIndex === -1 ? "circle" : "square"
  };
  return marker;
}

function getCustomPointMarker(
  customPoints: Array<{ [key: string]: any }>,
  index: number
): any {
  return {
    fillColor: customPoints.map(
      (_, i) =>
        FluentUIStyles.fluentUIColorPalette[
          WhatIfConstants.MAX_SELECTION + 1 + i
        ]
    )[index],
    radius: 4,
    symbol: "triangle"
  };
}

function getCustomPointCustomData(
  customPoints: Array<{ [key: string]: any }>,
  jointDataset: JointDataset,
  chartProps?: IGenericChartProps
): any {
  const customdata = JointDataset.unwrap(
    customPoints,
    JointDataset.IndexLabel
  ).map((val) => {
    const dict: Dictionary<any> = {};
    dict[JointDataset.IndexLabel] = val;
    return dict;
  });
  customPoints.forEach((val, index) => {
    customdata[index].Name = val.Name ? val.Name : val.Index;
    customdata[index].AbsoluteIndex = val.AbsoluteIndex;
  });

  if (chartProps && chartProps.xAxis && chartProps.yAxis) {
    const metaX = jointDataset.metaDict[chartProps.xAxis.property];
    const metaY = jointDataset.metaDict[chartProps.yAxis.property];
    const rawX = JointDataset.unwrap(customPoints, chartProps.xAxis.property);
    const rawY = JointDataset.unwrap(customPoints, chartProps.yAxis.property);

    rawX.forEach((val, index) => {
      if (metaX?.treatAsCategorical) {
        customdata[index].X = metaX.sortedCategoricalValues?.[val];
      } else {
        customdata[index].X = (val as number).toLocaleString(undefined, {
          maximumSignificantDigits: 5
        });
      }
      customdata[index].rawXValue = val;
      if (metaY?.treatAsCategorical) {
        customdata[index].Y = metaY.sortedCategoricalValues?.[rawY[index]];
      } else {
        customdata[index].Y = (rawY[index] as number).toLocaleString(
          undefined,
          {
            maximumSignificantDigits: 5
          }
        );
      }
      let hovertemplate = "";
      hovertemplate += `${customdata[index].Name}<br>`;
      hovertemplate += `${metaX.label}: ${customdata[index].X}<br>`;
      hovertemplate += `${metaY.label}: ${customdata[index].Y}<br>`;
      customdata[index].rawYValue = rawY[index];

      if (jointDataset.datasetMetaData?.featureMetaData !== undefined) {
        const identityFeatureName =
          jointDataset.datasetMetaData.featureMetaData?.identity_feature_name;

        if (identityFeatureName !== undefined) {
          const jointDatasetFeatureName =
            jointDataset.getJointDatasetFeatureName(identityFeatureName);

          if (jointDatasetFeatureName !== undefined) {
            const metaIdentityFeature =
              jointDataset.metaDict[jointDatasetFeatureName];
            const rawIdentityFeature = JointDataset.unwrap(
              customPoints,
              jointDatasetFeatureName
            );
            rawIdentityFeature.forEach((val, index) => {
              if (metaIdentityFeature?.treatAsCategorical) {
                customdata[index].ID =
                  metaIdentityFeature.sortedCategoricalValues?.[val];
              } else {
                customdata[index].ID = (val as number).toLocaleString(
                  undefined,
                  {
                    maximumSignificantDigits: 5
                  }
                );
              }
            });
            hovertemplate += `${localization.Common.identityFeature} (${metaIdentityFeature.label}): ${customdata[index].ID}<br>`;
          }
        }
      }

      hovertemplate += `${localization.Interpret.Charts.rowIndex}: ${customdata[index].Index}<br>`;
      hovertemplate += `${localization.Interpret.Charts.absoluteIndex}: ${customdata[index].AbsoluteIndex}<br>`;
      hovertemplate += "<extra></extra>";
      customdata[index].template = hovertemplate;
    });
  }
  return customdata;
}
