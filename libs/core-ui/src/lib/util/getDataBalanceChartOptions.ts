// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { SeriesOptionsType } from "highcharts";

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
  datasetName?: string
): IHighchartsConfig {
  const features = distributionBalanceMeasures.features;
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
      type: "column"
    },
    series: data,
    subtitle: { text: datasetName }, // undefined datasetName => subtitle is not shown
    title: {
      text: `Comparison of ${features.join(", ")} with Uniform Distribution`
    },
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
  datasetName?: string
): IHighchartsConfig {
  const measure = featureBalanceMeasureMap.get(selectedMeasure);
  if (!measure) {
    return {};
  }

  const features = new Map<string, string[]>([
    [selectedFeature, featureBalanceMeasures.featureValues[selectedFeature]]
  ]);
  const featureNames = features.get(selectedFeature);
  const featureValues: number[][] = [];

  features.forEach((classes, featureName) => {
    classes.forEach((classA, colIndex) => {
      classes.forEach((classB, rowIndex) => {
        // TODO: Need to figure out which measures are ok to use for heatmap
        const featureValue = getFeatureBalanceMeasures(
          featureBalanceMeasures.measures,
          featureName,
          classA,
          classB
        )[measure.varName];

        // Feature values don't exist for the diagonal of the heatmap (i.e. the same class)
        // Additionally, some feature values may be undefined/invalid/NaN
        if (featureValue && colIndex !== rowIndex) {
          featureValues.push(
            [colIndex, rowIndex, featureValue],
            [rowIndex, colIndex, featureValue]
          );
        }
      });
    });
  });

  return {
    chart: {
      numberFormatter: (value: number) => value.toFixed(3),
      type: "heatmap"
    },
    colorAxis: {
      max: measure.range ? measure.range[1] : undefined, // undefined range => max value is used
      min: measure.range ? measure.range[0] : undefined // undefined range => min value is used
    },
    legend: {
      align: "right",
      layout: "vertical",
      margin: 0,
      symbolHeight: 280,
      verticalAlign: "top",
      y: 25
    },
    series: [
      {
        data: featureValues,
        dataLabels: {
          enabled: true
        },
        name: selectedFeature,
        type: "heatmap"
      }
    ],
    subtitle: { text: datasetName }, // undefined datasetName => subtitle is not shown
    title: {
      text: `Comparison of ${selectedMeasure} on all classes of ${selectedFeature}`
    },
    xAxis: {
      categories: featureNames,
      title: { text: "Class B" }
    },
    yAxis: {
      categories: featureNames,
      title: { text: "Class A" }
    }
  };
}
