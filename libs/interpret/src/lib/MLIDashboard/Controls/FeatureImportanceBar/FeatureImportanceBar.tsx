// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { getTheme, Text } from "@fluentui/react";
import {
  PartialRequired,
  JointDataset,
  ChartTypes,
  FluentUIStyles
} from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";
import { IPlotlyProperty, AccessibleChart } from "@responsible-ai/mlchartlib";
import _ from "lodash";
import Plotly from "plotly.js";
import React from "react";

import { LoadingSpinner } from "../../SharedComponents/LoadingSpinner";
import { IGlobalSeries } from "../GlobalExplanationTab/IGlobalSeries";

import { featureImportanceBarStyles } from "./FeatureImportanceBar.styles";

export interface IFeatureBarProps {
  jointDataset: JointDataset | undefined;
  chartType: ChartTypes;
  yAxisLabels: string[];
  sortArray: number[];
  selectedFeatureIndex?: number;
  selectedSeriesIndex?: number;
  topK: number;
  unsortedX: string[];
  unsortedSeries: IGlobalSeries[];
  originX?: string[];
  xMapping?: string[];
  onFeatureSelection?: (seriesIndex: number, featureIndex: number) => void;
}

export interface IFeatureBarState {
  plotlyProps: IPlotlyProperty | undefined;
}

export class FeatureImportanceBar extends React.PureComponent<
  IFeatureBarProps,
  IFeatureBarState
> {
  public constructor(props: IFeatureBarProps) {
    super(props);
    this.state = {
      plotlyProps: undefined
    };
  }

  public componentDidUpdate(prevProps: IFeatureBarProps): void {
    if (
      this.props.unsortedSeries !== prevProps.unsortedSeries ||
      this.props.sortArray !== prevProps.sortArray ||
      this.props.chartType !== prevProps.chartType
    ) {
      this.setState({ plotlyProps: undefined });
    }
  }

  public render(): React.ReactNode {
    const relayoutArg: Partial<Plotly.Layout> = {
      "xaxis.range": [-0.5, +this.props.topK - 0.5]
    };
    const plotlyProps = this.state.plotlyProps;
    if (plotlyProps) {
      _.set(plotlyProps, "layout.xaxis.range", [-0.5, +this.props.topK - 0.5]);
    }

    if (
      !this.props.unsortedSeries ||
      this.props.unsortedSeries.length === 0 ||
      !this.props.sortArray ||
      this.props.sortArray.length === 0
    ) {
      return (
        <div className={featureImportanceBarStyles.noData}>
          <Text variant={"xxLarge"}>{localization.Core.NoData.Title}</Text>
        </div>
      );
    }
    if (this.state.plotlyProps === undefined) {
      this.loadProps();
      return <LoadingSpinner />;
    }
    return (
      <div
        id="FeatureImportanceBar"
        className={featureImportanceBarStyles.chartWithVertical}
      >
        <div className={featureImportanceBarStyles.verticalAxis}>
          <div className={featureImportanceBarStyles.rotatedVerticalBox}>
            <div>
              {this.props.yAxisLabels.map((label, i) => (
                <Text
                  block
                  variant="medium"
                  className={featureImportanceBarStyles.boldText}
                  key={i}
                >
                  {label}
                </Text>
              ))}
            </div>
          </div>
        </div>
        {plotlyProps && (
          <AccessibleChart
            plotlyProps={plotlyProps}
            theme={getTheme()}
            relayoutArg={relayoutArg}
            onClickHandler={this.selectPointFromChart}
          />
        )}
      </div>
    );
  }

  private loadProps(): void {
    setTimeout(() => {
      const props = this.buildBarPlotlyProps();
      this.setState({ plotlyProps: props });
    }, 1);
  }

  private buildBarPlotlyProps(): IPlotlyProperty {
    const sortedIndexVector = this.props.sortArray;
    const baseSeries: PartialRequired<IPlotlyProperty, "layout"> = {
      config: {
        displaylogo: false,
        displayModeBar: false,
        responsive: true
      },
      data: [],
      layout: {
        autosize: true,
        dragmode: false,
        hovermode: "closest",
        margin: { b: 30, l: 0, r: 10, t: 10 },
        showlegend: false,
        xaxis: {
          automargin: true,
          color: FluentUIStyles.chartAxisColor,
          showgrid: false,
          tickfont: {
            color: FluentUIStyles.chartAxisColor,
            family: "Roboto, Helvetica Neue, sans-serif",
            size: 11
          }
        },
        yaxis: {
          automargin: true,
          color: FluentUIStyles.chartAxisColor,
          gridcolor: "#e5e5e5",
          showgrid: true,
          tickfont: {
            color: FluentUIStyles.chartAxisColor,
            family: "Roboto, Helvetica Neue, sans-serif",
            size: 11
          },
          zeroline: true
        }
      }
    };

    const xText = sortedIndexVector.map((i) => this.props.unsortedX[i]);
    const xOriginText = sortedIndexVector.map((i) => {
      if (this.props.originX) {
        return this.props.originX[i];
      }
      return this.props.unsortedX[i];
    });
    if (this.props.chartType === ChartTypes.Bar) {
      baseSeries.layout.barmode = "group";
      let hovertemplate = this.props.unsortedSeries[0].unsortedFeatureValues
        ? "%{customdata.HoverText}: %{customdata.Yvalue}<br>"
        : `${localization.Interpret.Charts.featurePrefix}: %{customdata.HoverText}<br>`;
      hovertemplate += `${localization.Interpret.Charts.importancePrefix}: %{customdata.Yformatted}<br>`;
      hovertemplate += "%{customdata.Name}<br>";
      hovertemplate += "<extra></extra>";

      const x = sortedIndexVector.map((_, index) => index);

      this.props.unsortedSeries.forEach((series, seriesIndex) => {
        baseSeries.data.push({
          customdata: sortedIndexVector.map((value, index) => {
            return {
              HoverText: xOriginText[index],
              Name: series.name,
              Yformatted: series.unsortedAggregateY[value].toLocaleString(
                undefined,
                {
                  maximumFractionDigits: 3
                }
              ),
              Yvalue: series.unsortedFeatureValues
                ? series.unsortedFeatureValues[value]
                : undefined
            };
          }),
          hoverinfo: "all",
          hovertemplate,
          marker: {
            color: sortedIndexVector.map((index) =>
              index === this.props.selectedFeatureIndex &&
              seriesIndex === this.props.selectedSeriesIndex
                ? FluentUIStyles.fluentUIColorPalette[series.colorIndex]
                : FluentUIStyles.fluentUIColorPalette[series.colorIndex]
            )
          },
          name: series.name,
          orientation: "v",
          text: xText,
          type: "bar",
          x,
          y: sortedIndexVector.map((index) => series.unsortedAggregateY[index])
        } as any);
      });
    } else if (this.props.chartType === ChartTypes.Box) {
      _.set(baseSeries.layout, "boxmode", "group");
      this.props.unsortedSeries.forEach((series) => {
        const base: number[] = [];
        const x = base.concat(
          ...sortedIndexVector.map(
            (sortIndex, xIndex) =>
              series.unsortedIndividualY?.[sortIndex].map(() => xIndex) || []
          )
        );
        const y = base.concat(
          ...sortedIndexVector.map(
            (index) => series.unsortedIndividualY?.[index] || []
          )
        );
        baseSeries.data.push({
          boxmean: true,
          marker: {
            color: FluentUIStyles.fluentUIColorPalette[series.colorIndex]
          },
          name: series.name,
          type: "box",
          x,
          y
        });
      });
    }

    const tickvals = sortedIndexVector.map((_, index) => index);

    _.set(baseSeries, "layout.xaxis.ticktext", xText);
    _.set(baseSeries, "layout.xaxis.tickvals", tickvals);
    return baseSeries;
  }

  private selectPointFromChart = (data: any): void => {
    if (this.props.onFeatureSelection === undefined) {
      return;
    }
    const trace = data.points[0];
    const featureNumber = this.props.sortArray[trace.x];
    this.props.onFeatureSelection(trace.curveNumber, featureNumber);
  };
}
