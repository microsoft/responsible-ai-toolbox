// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { getTheme, Text } from "@fluentui/react";
import {
  Cohort,
  JointDataset,
  IExplanationModelMetadata,
  ModelTypes,
  WeightVectorOption,
  IGenericChartProps,
  FluentUIStyles
} from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";
import {
  AccessibleChart,
  IPlotlyProperty,
  PlotlyMode
} from "@responsible-ai/mlchartlib";
import _, { Dictionary } from "lodash";
import React from "react";

import { dependencePlotStyles } from "./DependencePlot.styles";

export interface IDependecePlotProps {
  chartProps: IGenericChartProps | undefined;
  jointDataset: JointDataset;
  cohort: Cohort;
  cohortIndex: number;
  metadata: IExplanationModelMetadata;
  selectedWeight: WeightVectorOption;
  selectedWeightLabel: string;
  onChange: (props: IGenericChartProps) => void;
}

export class DependencePlot extends React.PureComponent<IDependecePlotProps> {
  public static basePlotlyProperties: IPlotlyProperty = {
    config: { displaylogo: false, displayModeBar: false, responsive: true },
    data: [{}],
    layout: {
      autosize: true,
      dragmode: false,
      font: {
        size: 10
      },
      hovermode: "closest",
      margin: {
        b: 20,
        l: 10,
        r: 10,
        t: 10
      },
      showlegend: false,
      xaxis: {
        automargin: true,
        color: FluentUIStyles.chartAxisColor,
        gridcolor: "#e5e5e5",
        showgrid: true,
        tickfont: {
          family: "Roboto, Helvetica Neue, sans-serif",
          size: 11
        },
        zeroline: true
      },
      yaxis: {
        automargin: true,
        color: FluentUIStyles.chartAxisColor,
        gridcolor: "#e5e5e5",
        showgrid: true,
        tickfont: {
          family: "Roboto, Helvetica Neue, sans-serif",
          size: 11
        },
        zeroline: true
      }
    }
  };

  public render(): React.ReactNode {
    const classNames = dependencePlotStyles();
    if (this.props.chartProps === undefined) {
      return (
        <div className={classNames.secondaryChartPlaceholderBox}>
          <div className={classNames.secondaryChartPlaceholderSpacer}>
            <Text variant="large" className={classNames.faintText}>
              {localization.Interpret.DependencePlot.placeholder}
            </Text>
          </div>
        </div>
      );
    }
    const plotlyProps = this.generatePlotlyProps();
    const yAxisLabel =
      this.props.metadata.modelType === ModelTypes.Regression
        ? this.props.jointDataset.metaDict[this.props.chartProps.xAxis.property]
            .label
        : `${
            this.props.jointDataset.metaDict[
              this.props.chartProps.xAxis.property
            ].label
          } : ${this.props.selectedWeightLabel}`;
    return (
      <div className={classNames.DependencePlot}>
        <div className={classNames.chartWithAxes}>
          <div className={classNames.chartWithVertical}>
            <div className={classNames.verticalAxis}>
              <div className={classNames.rotatedVerticalBox}>
                <Text variant={"medium"} block>
                  {localization.Interpret.DependencePlot.featureImportanceOf}
                </Text>
                <Text variant={"medium"}>{yAxisLabel}</Text>
              </div>
            </div>
            <div className={classNames.chart}>
              <AccessibleChart plotlyProps={plotlyProps} theme={getTheme()} />
            </div>
          </div>
          <div className={classNames.horizontalAxisWithPadding}>
            <div className={classNames.paddingDiv} />
            <div className={classNames.horizontalAxis}>
              <Text variant={"medium"}>
                {
                  this.props.jointDataset.metaDict[
                    this.props.chartProps.xAxis.property
                  ].label
                }
              </Text>
            </div>
          </div>
        </div>
      </div>
    );
  }

  private generatePlotlyProps(): IPlotlyProperty {
    const plotlyProps = _.cloneDeep(DependencePlot.basePlotlyProperties);
    if (!this.props.chartProps) {
      return plotlyProps;
    }
    const chartProps = this.props.chartProps;
    const jointData = this.props.jointDataset;
    const cohort = this.props.cohort;
    plotlyProps.data[0].hoverinfo = "all";
    let hovertemplate = "";
    if (
      chartProps.colorAxis &&
      (chartProps.colorAxis.options.bin ||
        jointData.metaDict[chartProps.colorAxis.property]?.treatAsCategorical)
    ) {
      cohort.sort(chartProps.colorAxis.property);
    }
    const customdata = cohort.unwrap(JointDataset.IndexLabel).map((val) => {
      const dict: Dictionary<any> = {};
      dict[JointDataset.IndexLabel] = val;
      return dict;
    });
    plotlyProps.data[0].type = chartProps.chartType;
    plotlyProps.data[0].mode = PlotlyMode.Markers;
    plotlyProps.data[0].marker = {
      color: FluentUIStyles.fluentUIColorPalette[this.props.cohortIndex]
    };
    if (chartProps.xAxis) {
      if (jointData.metaDict[chartProps.xAxis.property]?.treatAsCategorical) {
        const xLabels =
          jointData.metaDict[chartProps.xAxis.property].sortedCategoricalValues;
        const xLabelIndexes = xLabels?.map((_, index) => index);
        _.set(plotlyProps, "layout.xaxis.ticktext", xLabels);
        _.set(plotlyProps, "layout.xaxis.tickvals", xLabelIndexes);
      }
      const rawX = cohort.unwrap(chartProps.xAxis.property);
      const xLabel = jointData.metaDict[chartProps.xAxis.property].label;
      if (chartProps.xAxis.options.dither) {
        const dithered = cohort.unwrap(JointDataset.DitherLabel);
        plotlyProps.data[0].x = dithered.map((dither, index) => {
          return rawX[index] + dither;
        });
        hovertemplate += `${xLabel}: %{customdata.X}<br>`;
        rawX.forEach((val, index) => {
          // If categorical, show string value in tooltip
          if (
            jointData.metaDict[chartProps.xAxis.property]?.treatAsCategorical
          ) {
            customdata[index].X =
              jointData.metaDict[
                chartProps.xAxis.property
              ].sortedCategoricalValues?.[val];
          } else {
            customdata[index].X = val;
          }
        });
      } else {
        plotlyProps.data[0].x = rawX;
        hovertemplate += `${xLabel}: %{x}<br>`;
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
      const rawY: number[] = cohort.unwrap(chartProps.yAxis.property);
      const yLabel = localization.Interpret.Charts.featureImportance;
      plotlyProps.data[0].y = rawY;
      rawY.forEach((val, index) => {
        customdata[index].Yformatted = val.toLocaleString(undefined, {
          maximumFractionDigits: 3
        });
      });
      hovertemplate += `${yLabel}: %{customdata.Yformatted}<br>`;
    }
    const indices = cohort.unwrap(JointDataset.IndexLabel, false);
    indices.forEach((absoluteIndex, i) => {
      customdata[i].AbsoluteIndex = absoluteIndex;
    });
    hovertemplate += `${localization.Interpret.Charts.rowIndex}: %{customdata.AbsoluteIndex}<br>`;
    hovertemplate += "<extra></extra>";
    plotlyProps.data[0].customdata = customdata as any;
    plotlyProps.data[0].hovertemplate = hovertemplate;
    return plotlyProps;
  }
}
