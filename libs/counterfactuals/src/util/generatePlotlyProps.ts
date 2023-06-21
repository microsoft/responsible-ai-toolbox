// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  ChartTypes,
  Cohort,
  FluentUIStyles,
  IGenericChartProps,
  JointDataset
} from "@responsible-ai/core-ui";
import { WhatIfConstants } from "@responsible-ai/interpret";
import { localization } from "@responsible-ai/localization";
import { IData, IPlotlyProperty, PlotlyMode } from "@responsible-ai/mlchartlib";
import _, { Dictionary } from "lodash";

export function generatePlotlyProps(
  jointData: JointDataset,
  chartProps: IGenericChartProps,
  cohort: Cohort,
  selectedPointsIndexes: number[],
  customPoints: Array<{
    [key: string]: any;
  }>
): IPlotlyProperty {
  const plotlyProps = _.cloneDeep(WhatIfConstants.basePlotlyProperties);
  plotlyProps.data[0].hoverinfo = "all";
  const indexes = cohort.unwrap(JointDataset.IndexLabel);
  plotlyProps.data[0].type = chartProps.chartType as ChartTypes;
  plotlyProps.data[0].mode = PlotlyMode.Markers;
  plotlyProps.data[0].marker = {
    color: indexes.map((rowIndex) => {
      const selectionIndex = selectedPointsIndexes.indexOf(rowIndex);
      if (selectionIndex === -1) {
        return FluentUIStyles.fabricColorInactiveSeries;
      }
      return FluentUIStyles.fluentUIColorPalette[selectionIndex];
    }) as any,
    size: 8,
    symbol: indexes.map((i) =>
      selectedPointsIndexes.includes(i) ? "square" : "circle"
    ) as any
  };

  plotlyProps.data[1] = {
    marker: {
      color: customPoints.map(
        (_, i) =>
          FluentUIStyles.fluentUIColorPalette[
            WhatIfConstants.MAX_SELECTION + 1 + i
          ]
      ),
      size: 12,
      symbol: "star"
    },
    mode: PlotlyMode.Markers,
    type: "scatter"
  };

  plotlyProps.data[2] = {
    hoverinfo: "text",
    marker: {
      color: "rgba(0,0,0,0)",
      line: {
        color:
          FluentUIStyles.fluentUIColorPalette[
            WhatIfConstants.MAX_SELECTION + 1 + customPoints.length
          ],
        width: 2
      },
      opacity: 0.5,
      size: 12,
      symbol: "star"
    },
    mode: PlotlyMode.Markers,
    text: "Editable What-If point",
    type: "scatter"
  };

  if (chartProps.xAxis) {
    if (jointData.metaDict[chartProps.xAxis.property]?.treatAsCategorical) {
      const xLabels =
        jointData.metaDict[chartProps.xAxis.property].sortedCategoricalValues;
      const xLabelIndexes = xLabels?.map((_, index) => index);
      _.set(plotlyProps, "layout.xaxis.ticktext", xLabels);
      _.set(plotlyProps, "layout.xaxis.tickvals", xLabelIndexes);
    }
  }
  if (chartProps.yAxis) {
    if (jointData.metaDict[chartProps.yAxis.property]?.treatAsCategorical) {
      const yLabels =
        jointData.metaDict[chartProps.yAxis.property].sortedCategoricalValues;
      const yLabelIndexes = yLabels?.map((_, index) => index);
      _.set(plotlyProps, "layout.yaxis.ticktext", yLabels);
      _.set(plotlyProps, "layout.yaxis.tickvals", yLabelIndexes);
    }
  }

  generateDataTrace(
    cohort.filteredData,
    chartProps,
    plotlyProps.data[0],
    jointData
  );
  generateDataTrace(customPoints, chartProps, plotlyProps.data[1], jointData);
  return plotlyProps;
}

function generateDataTrace(
  dictionary: Array<{ [key: string]: string | number }>,
  chartProps: IGenericChartProps,
  trace: IData,
  jointDataset: JointDataset
): void {
  const customdata = JointDataset.unwrap(
    dictionary,
    JointDataset.IndexLabel
  ).map((val) => {
    const dict: Dictionary<any> = {};
    dict[JointDataset.IndexLabel] = val;
    return dict;
  });
  dictionary.forEach((val, index) => {
    customdata[index].Name = val.Name ? val.Name : val.Index;
  });
  let hovertemplate = "{point.customdata.Name}<br>";
  if (chartProps.xAxis) {
    const metaX = jointDataset.metaDict[chartProps.xAxis.property];
    const rawX = JointDataset.unwrap(dictionary, chartProps.xAxis.property);
    hovertemplate += `${metaX.label}: {point.customdata.X}<br>`;

    rawX.forEach((val, index) => {
      if (metaX?.treatAsCategorical) {
        customdata[index].X = metaX.sortedCategoricalValues?.[val];
      } else {
        customdata[index].X = (val as number).toLocaleString(undefined, {
          maximumSignificantDigits: 5
        });
      }
    });
    if (chartProps.xAxis.options.dither) {
      const dither = JointDataset.unwrap(dictionary, JointDataset.DitherLabel);
      trace.x = dither.map((ditherVal, index) => {
        return rawX[index] + ditherVal;
      });
    } else {
      trace.x = rawX;
    }
  }
  if (chartProps.yAxis) {
    const metaY = jointDataset.metaDict[chartProps.yAxis.property];
    const rawY = JointDataset.unwrap(dictionary, chartProps.yAxis.property);
    hovertemplate += `${metaY.label}: {point.customdata.Y}<br>`;
    rawY.forEach((val, index) => {
      if (metaY?.treatAsCategorical) {
        customdata[index].Y = metaY.sortedCategoricalValues?.[val];
      } else {
        customdata[index].Y = (val as number).toLocaleString(undefined, {
          maximumSignificantDigits: 5
        });
      }
    });
    if (chartProps.yAxis.options.dither) {
      const dither = JointDataset.unwrap(dictionary, JointDataset.DitherLabel2);
      trace.y = dither.map((ditherVal, index) => {
        return rawY[index] + ditherVal;
      });
    } else {
      trace.y = rawY;
    }
  }
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
          dictionary,
          jointDatasetFeatureName
        );
        hovertemplate += `${localization.Common.identityFeature} (${metaIdentityFeature.label}): {point.customdata.ID}<br>`;
        rawIdentityFeature.forEach((val, index) => {
          if (metaIdentityFeature?.treatAsCategorical) {
            customdata[index].ID =
              metaIdentityFeature.sortedCategoricalValues?.[val];
          } else {
            customdata[index].ID = (val as number).toLocaleString(undefined, {
              maximumSignificantDigits: 5
            });
          }
        });
      }
    }
  }
  hovertemplate += `${localization.Interpret.Charts.rowIndex}: {point.customdata.Index}<br>`;
  hovertemplate += "<extra></extra>";
  trace.customdata = customdata as any;
  trace.hovertemplate = hovertemplate;
}
