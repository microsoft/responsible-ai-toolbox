// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  ChartTypes,
  DatasetCohort,
  IGenericChartProps,
  JointDataset
} from "@responsible-ai/core-ui";
import {
  ICategoricalRange,
  INumericRange,
  RangeTypes
} from "@responsible-ai/mlchartlib";

export function generateDefaultChartAxes(
  jointDataset: JointDataset
): IGenericChartProps | undefined {
  const yKey = `${JointDataset.DataLabelRoot}0`;
  const yIsDithered = jointDataset.metaDict[yKey]?.treatAsCategorical;
  const chartProps: IGenericChartProps = {
    chartType: ChartTypes.Scatter,
    xAxis: {
      options: {},
      property: jointDataset.hasPredictedProbabilities
        ? `${JointDataset.ProbabilityYRoot}0`
        : JointDataset.IndexLabel
    },
    yAxis: {
      options: {
        bin: false,
        dither: yIsDithered
      },
      property: yKey
    }
  };
  return chartProps;
}

export function generateDefaultChartAxesWithDatasetCohort(
  datasetCohort?: DatasetCohort,
  datasetFeatureRanges?: { [key: string]: INumericRange | ICategoricalRange }
): IGenericChartProps | undefined {
  if (!datasetCohort) {
    return;
  }
  const yKey = datasetCohort.dataset.feature_names[0];
  const yIsDithered = datasetFeatureRanges
    ? datasetFeatureRanges[yKey].rangeType === RangeTypes.Categorical
    : false;
  const defaultClass =
    datasetCohort.dataset.class_names && datasetCohort.dataset.class_names[0];
  const chartProps: IGenericChartProps = {
    chartType: ChartTypes.Scatter,
    xAxis: {
      options: {},
      property: datasetCohort.dataset.probability_y
        ? DatasetCohort.ProbabilityY + defaultClass
        : DatasetCohort.Index
    },
    yAxis: {
      options: {
        bin: false,
        dither: yIsDithered
      },
      property: yKey
    }
  };
  return chartProps;
}
