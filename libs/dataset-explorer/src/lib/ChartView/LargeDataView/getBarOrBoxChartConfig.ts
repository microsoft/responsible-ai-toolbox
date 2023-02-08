// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { getTheme } from "@fluentui/react";
import {
  Cohort,
  getPrimaryChartColor,
  JointDataset
} from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";

export async function getBarOrBoxChartConfig(
  dataCohort: Cohort,
  jointDataset: JointDataset,
  xAxisProperty: string,
  yAxisProperty: string,
  requestDatasetAnalysisBarChart: (
    filter: unknown[],
    compositeFilter: unknown[],
    columnNameX: string,
    treatColumnXAsCategorical: boolean,
    columnNameY: string,
    treatColumnYAsCategorical: boolean,
    numBins: number,
    abortSignal: AbortSignal
  ) => Promise<any>,
  requestDatasetAnalysisBoxChart: (
    filter: unknown[],
    compositeFilter: unknown[],
    columnNameX: string,
    columnNameY: string,
    numBins: number,
    abortSignal: AbortSignal
  ) => Promise<any>
): Promise<unknown> {
  const filtersRelabeled = Cohort.getLabeledFilters(
    dataCohort.filters,
    jointDataset
  );
  const compositeFiltersRelabeled = Cohort.getLabeledCompositeFilters(
    dataCohort.compositeFilters,
    jointDataset
  );

  const treatYAsCategorical =
    jointDataset.metaDict[yAxisProperty].isCategorical ||
    jointDataset.metaDict[yAxisProperty]?.treatAsCategorical;

  let numberOfBins = 5;
  if (jointDataset?.binDict?.Index) {
    numberOfBins = jointDataset.binDict.Index.length;
  }

  if (treatYAsCategorical) {
    const treatXAsCategorical =
      (jointDataset.metaDict[xAxisProperty].isCategorical ||
        jointDataset.metaDict[xAxisProperty]?.treatAsCategorical) ??
      false;

    const result = await requestDatasetAnalysisBarChart(
      filtersRelabeled,
      compositeFiltersRelabeled,
      jointDataset.metaDict[xAxisProperty].label,
      treatXAsCategorical,
      jointDataset.metaDict[yAxisProperty].label,
      treatYAsCategorical,
      numberOfBins,
      new AbortController().signal
    );
    const datasetBarConfigOverride = {
      chart: {
        type: "column"
      },
      series: result.values,
      xAxis: {
        categories: result.buckets
      }
    };
    return datasetBarConfigOverride;
  }
  const result = await requestDatasetAnalysisBoxChart(
    filtersRelabeled,
    compositeFiltersRelabeled,
    jointDataset.metaDict[xAxisProperty].label,
    jointDataset.metaDict[yAxisProperty].label,
    numberOfBins,
    new AbortController().signal
  );

  const boxGroupData: any = [];
  const theme = getTheme();

  let userFeatureName =
    localization.ModelAssessment.ModelOverview.BoxPlot.boxPlotSeriesLabel;
  if (yAxisProperty) {
    userFeatureName = jointDataset.metaDict[yAxisProperty].label;
  }
  boxGroupData.push({
    color: undefined,
    data: result.values,
    fillColor: theme.semanticColors.inputBackgroundChecked,
    name: userFeatureName
  });
  boxGroupData.push({
    data: result.outliers,
    marker: {
      fillColor: getPrimaryChartColor(theme)
    },
    name: localization.ModelAssessment.ModelOverview.BoxPlot.outlierLabel,
    type: "scatter"
  });
  const datasetBoxConfigOverride = {
    chart: {
      type: "boxplot"
    },
    series: boxGroupData,
    xAxis: {
      categories: result.buckets
    }
  };
  return datasetBoxConfigOverride;
}
