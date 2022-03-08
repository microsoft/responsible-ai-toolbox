// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { ITheme } from "@fluentui/react";

import { IHighchartsConfig } from "../Highchart/IHighchartsConfig";
import {
  featureBalanceMeasureMap,
  getDistributionBalanceMeasures,
  getFeatureBalanceMeasures,
  IDataBalanceMeasures
} from "../Interfaces/DataBalanceInterfaces";

export function getDistributionBalanceChartOptions(
  balanceMeasures: IDataBalanceMeasures,
  theme?: ITheme
): IHighchartsConfig {
  const colorTheme = {
    axisColor: theme?.palette.neutralPrimary,
    axisGridColor: theme?.palette.neutralLight,
    backgroundColor: theme?.palette.white,
    fontColor: theme?.semanticColors.bodyText
  };
  if (!balanceMeasures.distributionBalanceMeasures) {
    return {};
  }
  const distData = Object.values(
    getDistributionBalanceMeasures(
      balanceMeasures.distributionBalanceMeasures.measures,
      "race"
    )
  );
  const distData2 = Object.values(
    getDistributionBalanceMeasures(
      balanceMeasures.distributionBalanceMeasures.measures,
      "sex"
    )
  );

  return {
    chart: {
      backgroundColor: colorTheme.backgroundColor,
      type: "column"
    },
    series: [
      {
        data: distData,
        name: "race",
        type: "column"
      },
      {
        data: distData2,
        name: "sex",
        type: "column"
      }
    ]
    // xAxis: {
    //   categories: measureNames
    // }
  };
}

export function getFeatureBalanceChartOptions(
  balanceMeasures: IDataBalanceMeasures,
  selectedFeature: string,
  selectedMeasure: string,
  theme?: ITheme
): IHighchartsConfig {
  const colorTheme = {
    axisColor: theme?.palette.neutralPrimary,
    axisGridColor: theme?.palette.neutralLight,
    backgroundColor: theme?.palette.white,
    fontColor: theme?.semanticColors.bodyText
  };
  const featureBalanceMeasures = balanceMeasures.featureBalanceMeasures;
  if (!featureBalanceMeasures) {
    return {};
  }
  // get the ranges for the specific feature to look at
  const measure = featureBalanceMeasureMap.get(selectedMeasure);
  if (!measure) {
    return {};
  }

  const features = new Map<string, string[]>([
    [selectedFeature, featureBalanceMeasures.featureValues[selectedFeature]]
  ]);
  const featureNames = features.get(selectedFeature);
  const data: number[][] = [];
  features.forEach((classes, featureName) => {
    classes.forEach((classA, colIndex) => {
      classes.forEach((classB, rowIndex) => {
        const featureValue = getFeatureBalanceMeasures(
          featureBalanceMeasures.measures,
          featureName,
          classA,
          classB
        )[measure.varName];
        data.push([colIndex, rowIndex, featureValue]);
        data.push([rowIndex, colIndex, featureValue]);
      });
    });
  });
  console.log(data);
  return {
    chart: {
      backgroundColor: colorTheme.backgroundColor,
      type: "heatmap"
    },
    series: [
      {
        data,
        name: "race",
        type: "heatmap"
      }
    ],
    xAxis: {
      categories: featureNames
    },
    yAxis: {
      categories: featureNames
    }
  };
}
