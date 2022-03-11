// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  ColorAxisOptions,
  Point,
  SeriesOptionsType,
  TitleOptions
} from "highcharts";

import { IHighchartsConfig } from "../Highchart/IHighchartsConfig";
import {
  ApprovedAggregateMeasures,
  ApprovedDistributionMeasures,
  ApprovedFeatureBalanceMeasures,
  getAggregateBalanceMeasures,
  getDistributionBalanceMeasures,
  getFeatureBalanceMeasures,
  IAggregateBalanceMeasures,
  IDistributionBalanceMeasures,
  IFeatureBalanceMeasures
} from "../Interfaces/DataBalanceInterfaces";

export function getFeatureBalanceChartOptions(
  featureBalanceMeasures: IFeatureBalanceMeasures,
  selectedFeature: string,
  selectedMeasure: string,
  datasetName?: string
): IHighchartsConfig {
  const measure = ApprovedFeatureBalanceMeasures.get(selectedMeasure);
  const uniqueClasses = featureBalanceMeasures.uniqueClasses[selectedFeature];
  if (!measure || !uniqueClasses) {
    return {};
  }

  const data: number[][] = [];
  uniqueClasses.forEach((classA, colIndex) => {
    uniqueClasses.forEach((classB, rowIndex) => {
      const featureValue = getFeatureBalanceMeasures(
        featureBalanceMeasures.measures,
        selectedFeature,
        classA,
        classB
      )[measure.varName];

      // Feature values don't exist for the diagonal of the heatmap (i.e. the same class)
      // Additionally, some feature values may be undefined/invalid/NaN
      if (featureValue && colIndex !== rowIndex) {
        // Add the feature value for comparing class A (col index) to class B (row index)
        // The feature value may not be the same as the feature value when comparing class B to class A (swapped row and col)
        data.push([colIndex, rowIndex, featureValue]);
      }
    });
  });

  const titleOptions = {
    text: `Comparing ${selectedMeasure} on all classes of ${selectedFeature}`
  } as TitleOptions;
  if (datasetName) {
    titleOptions.text += ` in ${datasetName}`;
  }

  const colorAxisOptions = {} as ColorAxisOptions;
  if (measure.range) {
    [colorAxisOptions.min, colorAxisOptions.max] = measure.range;
  } else {
    const featureValues = data.map((row) => row[2]);
    colorAxisOptions.min = Math.min(...featureValues);
    colorAxisOptions.max = Math.max(...featureValues);
  }

  return {
    accessibility: {
      point: {
        descriptionFormatter(point) {
          const ix = point.index + 1,
            xName = getPointCategoryName(point, "x"),
            yName = getPointCategoryName(point, "y"),
            val = point.value;
          return `${ix}. ${xName} and ${yName} have a ${selectedMeasure} of ${val}.`;
        }
      }
    },
    chart: {
      numberFormatter: (value: number) => value.toFixed(3),
      type: "heatmap"
    },
    colorAxis: colorAxisOptions,
    legend: {
      align: "right",
      layout: "vertical",
      margin: 0,
      symbolHeight: 280,
      verticalAlign: "top",
      y: 35
    },
    series: [
      {
        data,
        dataLabels: {
          enabled: true
        },
        name: selectedFeature,
        type: "heatmap"
      }
    ],
    subtitle: {
      text: `<a target="_blank" href="https://microsoft.github.io/SynapseML/docs/features/responsible_ai/Data%20Balance%20Analysis/#feature-balance-measures">Reference Link for Feature Balance Measures</a>`,
      useHTML: true
    },
    title: titleOptions,
    tooltip: {
      formatter() {
        return `<b>${getPointCategoryName(
          this.point,
          "x"
        )}</b> and <b>${getPointCategoryName(
          this.point,
          "y"
        )}</b> have a <b>${selectedMeasure}</b> of <b>${
          this.point.value
        }</b><br><br>${
          ApprovedFeatureBalanceMeasures.get(selectedMeasure)?.description
        }`;
      }
    },
    xAxis: {
      categories: uniqueClasses,
      title: { text: "Class B" }
    },
    yAxis: {
      categories: uniqueClasses,
      title: { text: "Class A" }
    }
  };
}

function getPointCategoryName(point: Point, dimension: "x" | "y"): string {
  if (point.x === undefined || point.y === undefined) {
    return "N/A";
  }

  const series = point.series,
    isY = dimension === "y",
    axis = series[isY ? "yAxis" : "xAxis"];
  return axis.categories[isY ? point.y : point.x];
}

export function getDistributionBalanceChartOptions(
  distributionBalanceMeasures: IDistributionBalanceMeasures,
  datasetName?: string
): IHighchartsConfig {
  const approvedMeasureVarNames = new Set([
    ...ApprovedDistributionMeasures.keys()
  ]);

  // Assume that every feature has the same measures computed
  // and use the 1st feature to get a list of computed measures
  const computedMeasures = Object.keys(
    Object.values(distributionBalanceMeasures.measures)[0] // gets the measures dict for the 1st feature (i.e. 'race')
  ); //  gets just the keys of the measures dict (i.e. ['inf_norm_dist', 'js_dist', 'kl_divergence'])

  const measureOptions = computedMeasures
    .filter((measureVarName) => approvedMeasureVarNames.has(measureVarName))
    .map(
      (measureVarName) =>
        ApprovedDistributionMeasures.get(measureVarName)?.name ?? measureVarName
    );

  const features = distributionBalanceMeasures.features;
  const data = features.map((featureName: string) => {
    const measures = Object.entries(
      getDistributionBalanceMeasures(
        distributionBalanceMeasures.measures,
        featureName
      )
    );
    return {
      data: measures
        .filter(([measureVarNames]) =>
          approvedMeasureVarNames.has(measureVarNames)
        )
        .map(([_, value]) => value),
      name: featureName,
      type: "column"
    } as SeriesOptionsType;
  });

  const titleOptions = {
    text: `Comparing ${features.join(", ")} with Uniform Distribution`
  } as TitleOptions;
  if (datasetName) {
    titleOptions.text += ` in ${datasetName}`;
  }

  // TODO: Show the measure's description in a tooltip. Things tried but failed to work:
  // - Appending to the default tooltip (could not access default tooltip text)
  // - Overriding the default tooltip with a custom one (worked but could not render the colored circles that default tooltip has)
  // - Adding a custom hover-over as a load() event (could not figure out which measure was being hovered over)
  return {
    chart: {
      numberFormatter: (value: number) => value.toFixed(3),
      type: "column"
    },
    series: data,
    subtitle: {
      text: `<a target="_blank" href="https://microsoft.github.io/SynapseML/docs/features/responsible_ai/Data%20Balance%20Analysis/#distribution-balance-measures">Reference Link for Distribution Balance Measures</a>`,
      useHTML: true
    },
    title: titleOptions,
    xAxis: {
      categories: measureOptions,
      title: { text: "Distribution Measure" }
    },
    yAxis: {
      title: { text: "Measure Value" }
    }
  };
}

export function getAggregateBalanceChartOptions(
  aggregateBalanceMeasures: IAggregateBalanceMeasures,
  datasetName?: string
): IHighchartsConfig {
  const categories: string[] = [];
  const data = Object.entries(
    getAggregateBalanceMeasures(aggregateBalanceMeasures.measures)
  ).map(([k, v], i) => {
    const name = ApprovedAggregateMeasures.get(k)?.name;
    if (!name) {
      return {} as SeriesOptionsType;
    }
    categories.push(name);
    return {
      data: [[i, v]],
      name,
      type: "bar"
    } as SeriesOptionsType;
  });

  const titleOptions = {
    text: `Aggregate Balance Measures`
  } as TitleOptions;
  if (datasetName) {
    titleOptions.text += ` in ${datasetName}`;
  }

  return {
    chart: {
      numberFormatter: (value: number) => value.toFixed(3)
    },
    exporting: {
      showTable: false
    },
    plotOptions: {
      bar: {
        dataLabels: {
          enabled: true
        }
      }
    },
    series: data,
    subtitle: {
      text: `<a target="_blank" href="https://microsoft.github.io/SynapseML/docs/features/responsible_ai/Data%20Balance%20Analysis/#aggregate-balance-measures">Reference Link for Aggregate Balance Measures</a>`,
      useHTML: true
    },
    title: titleOptions,
    tooltip: {
      formatter() {
        const point = this.points?.[0];
        for (const v of ApprovedAggregateMeasures.values()) {
          if (v.name === point?.series.name) {
            return `<b>${point?.x}</b>: ${point?.y}<br><br>${v.description}`;
          }
        }

        return "";
      }
    },
    xAxis: {
      categories
    },
    yAxis: {
      title: { text: "Measure Value" }
    }
  };
}
