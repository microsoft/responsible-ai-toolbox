// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { getTheme } from "@fluentui/react";
import {
  FluentUIStyles,
  ColumnCategories,
  getPrimaryChartColor,
  JointDataset,
  Cohort,
  ChartTypes,
  IGenericChartProps
} from "@responsible-ai/core-ui";
import { IPlotlyProperty, PlotlyMode } from "@responsible-ai/mlchartlib";
import _ from "lodash";
import Plotly, { DataTransform } from "plotly.js";

import { basePlotlyProperties } from "./basePlotlyProperties";
import { buildCustomData } from "./buildCustomData";
import { buildHoverTemplate } from "./buildHoverTemplate";
import { getScatterSymbols } from "./ScatterUtils";

export function generatePlotlyProps(
  jointData: JointDataset,
  chartProps: IGenericChartProps,
  cohort: Cohort
): IPlotlyProperty {
  const plotlyProps = _.cloneDeep(basePlotlyProperties);
  plotlyProps.data[0].hoverinfo = "all";

  switch (chartProps.chartType) {
    case ChartTypes.Scatter: {
      if (
        chartProps.colorAxis &&
        (chartProps.colorAxis.options.bin ||
          jointData.metaDict[chartProps.colorAxis.property]?.treatAsCategorical)
      ) {
        cohort.sort(chartProps.colorAxis.property);
      }
      plotlyProps.data[0].type = chartProps.chartType;
      plotlyProps.data[0].mode = PlotlyMode.Markers;
      if (chartProps.xAxis) {
        if (jointData.metaDict[chartProps.xAxis.property]?.treatAsCategorical) {
          const xLabels =
            jointData.metaDict[chartProps.xAxis.property]
              .sortedCategoricalValues;
          const xLabelIndexes = xLabels?.map((_, index) => index);
          _.set(plotlyProps, "layout.xaxis.ticktext", xLabels);
          _.set(plotlyProps, "layout.xaxis.tickvals", xLabelIndexes);
        }
        const rawX = cohort.unwrap(chartProps.xAxis.property);
        if (chartProps.xAxis.options.dither) {
          const dithered = cohort.unwrap(JointDataset.DitherLabel);
          plotlyProps.data[0].x = dithered.map((dither, index) => {
            return rawX[index] + dither;
          });
        } else {
          plotlyProps.data[0].x = rawX;
        }
      }
      if (chartProps.yAxis) {
        if (jointData.metaDict[chartProps.yAxis.property]?.treatAsCategorical) {
          const yLabels =
            jointData.metaDict[chartProps.yAxis.property]
              .sortedCategoricalValues;
          const yLabelIndexes = yLabels?.map((_, index) => index);
          _.set(plotlyProps, "layout.yaxis.ticktext", yLabels);
          _.set(plotlyProps, "layout.yaxis.tickvals", yLabelIndexes);
        }
        const rawY = cohort.unwrap(chartProps.yAxis.property);
        if (chartProps.yAxis.options.dither) {
          const dithered = cohort.unwrap(JointDataset.DitherLabel2);
          plotlyProps.data[0].y = dithered.map((dither, index) => {
            return rawY[index] + dither;
          });
        } else {
          plotlyProps.data[0].y = rawY;
        }
      }
      if (chartProps.colorAxis) {
        const isBinned = chartProps.colorAxis.options?.bin;
        const rawColor = cohort.unwrap(chartProps.colorAxis.property, isBinned);

        if (
          jointData.metaDict[chartProps.colorAxis.property]
            ?.treatAsCategorical ||
          isBinned
        ) {
          const styles = jointData.metaDict[
            chartProps.colorAxis.property
          ].sortedCategoricalValues?.map((label, index) => {
            const symbols = getScatterSymbols();
            const colors = FluentUIStyles.scatterFluentUIColorPalette;
            return {
              target: index,
              value: {
                marker: {
                  color: colors[index],
                  symbol: symbols[index]
                },
                name: label
              }
            };
          });
          plotlyProps.data[0].transforms = [
            {
              groups: rawColor,
              styles,
              type: "groupby"
            }
          ];
          if (plotlyProps.layout) {
            plotlyProps.layout.showlegend = false;
          }
        } else {
          plotlyProps.data[0].marker = {
            color: rawColor,
            colorbar: {
              title: {
                side: "right",
                text: jointData.metaDict[chartProps.colorAxis.property].label
              } as any
            },
            colorscale: "Bluered"
          };
        }
      }
      break;
    }
    case ChartTypes.Histogram: {
      cohort.sort(chartProps.yAxis.property);
      const rawX = cohort.unwrap(chartProps.xAxis.property, true);
      const xMeta = jointData.metaDict[chartProps.xAxis.property];
      const yMeta = jointData.metaDict[chartProps.yAxis.property];
      const xLabels = xMeta.sortedCategoricalValues;
      const xLabelIndexes = xLabels?.map((_, index) => index);
      // color series will be set by the y axis if it is categorical, otherwise no color for aggregate charts
      if (!jointData.metaDict[chartProps.yAxis.property]?.treatAsCategorical) {
        plotlyProps.data[0].type = "box";
        // avoid trace0 when hovered
        plotlyProps.data[0].name = "";
        plotlyProps.data[0].x = rawX;
        plotlyProps.data[0].y = cohort.unwrap(chartProps.yAxis.property, false);
        plotlyProps.data[0].marker = {
          color: getPrimaryChartColor(getTheme())
        };
        _.set(plotlyProps, "layout.xaxis.ticktext", xLabels);
        _.set(plotlyProps, "layout.xaxis.tickvals", xLabelIndexes);
        break;
      }
      plotlyProps.data[0].type = "bar";

      const y = new Array(rawX.length).fill(1);
      plotlyProps.data[0].text = rawX.map((index) => xLabels?.[index] || "");
      plotlyProps.data[0].x = rawX;
      plotlyProps.data[0].y = y;
      _.set(plotlyProps, "layout.xaxis.ticktext", xLabels);
      _.set(plotlyProps, "layout.xaxis.tickvals", xLabelIndexes);
      const transforms: Array<Partial<Plotly.Transform>> = [
        {
          aggregations: [{ func: "sum", target: "y" }],
          groups: rawX,
          type: "aggregate"
        }
      ];
      if (
        chartProps.yAxis &&
        chartProps.yAxis.property !== ColumnCategories.None
      ) {
        const rawColor = cohort.unwrap(chartProps.yAxis.property, true);
        const styles = yMeta.sortedCategoricalValues?.map((label, index) => {
          return {
            target: index,
            value: {
              marker: {
                color: FluentUIStyles.fluentUIColorPalette[index]
              },
              name: label
            }
          };
        });
        transforms.push({
          groups: rawColor,
          styles,
          type: "groupby"
        });
      }
      plotlyProps.data[0].transforms = transforms as DataTransform[];
      break;
    }
    default:
  }
  plotlyProps.data[0].customdata = buildCustomData(
    jointData,
    chartProps,
    cohort
  );
  plotlyProps.data[0].hovertemplate = buildHoverTemplate(jointData, chartProps);
  return plotlyProps;
}
