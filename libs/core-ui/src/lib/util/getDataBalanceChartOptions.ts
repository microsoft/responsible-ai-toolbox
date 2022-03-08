// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { ITheme } from "@fluentui/react";
import { SeriesOptionsType, TitleOptions } from "highcharts";

import { IHighchartsConfig } from "../Highchart/IHighchartsConfig";
import {
  featureBalanceMeasureMap,
  getDistributionBalanceMeasures,
  getFeatureBalanceMeasures,
  IDistributionBalanceMeasures,
  IFeatureBalanceMeasures
} from "../Interfaces/DataBalanceInterfaces";

export function getDistributionBalanceChartOptions(
  distributionBalanceMeasures: IDistributionBalanceMeasures,
  datasetName?: string,
  theme?: ITheme
): IHighchartsConfig {
  if (
    !distributionBalanceMeasures ||
    !distributionBalanceMeasures.measures ||
    !distributionBalanceMeasures.features
  ) {
    return {};
  }

  const colorTheme = {
    axisColor: theme?.palette.neutralPrimary,
    axisGridColor: theme?.palette.neutralLight,
    backgroundColor: theme?.palette.white,
    fontColor: theme?.semanticColors.bodyText
  };

  const features = distributionBalanceMeasures.features;
  const titleOptions: TitleOptions = {
    text: `Comparison of ${features.join(", ")} with Uniform Distribution`
  };

  if (datasetName) {
    titleOptions.text += ` in ${datasetName}`;
  }

  const data = features.map(
    (featureName: string) =>
      ({
        data: Object.values(
          getDistributionBalanceMeasures(
            distributionBalanceMeasures.measures,
            featureName
          )
        ),
        name: featureName,
        type: "column"
      } as SeriesOptionsType)
  );

  // Assume that every feature has the same measures calculated
  // and use the 1st feature to get a list of measure types
  const firstMeasure = Object.values(distributionBalanceMeasures.measures)[0];
  const measureTypes = Object.keys(firstMeasure);

  return {
    chart: {
      backgroundColor: colorTheme.backgroundColor,
      type: "column"
    },
    series: data,
    title: titleOptions,
    xAxis: {
      categories: measureTypes,
      title: { text: "Distribution Measure" }
    },
    yAxis: {
      title: { text: "Measure Value" }
    }
  };
}

export function getFeatureBalanceChartOptions(
  featureBalanceMeasures: IFeatureBalanceMeasures,
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
