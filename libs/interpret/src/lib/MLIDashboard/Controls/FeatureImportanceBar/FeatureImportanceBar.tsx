// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { PartialRequired } from "@responsible-ai/core-ui";
import { IPlotlyProperty, AccessibleChart } from "@responsible-ai/mlchartlib";
import _ from "lodash";
import { getTheme, Text } from "office-ui-fabric-react";
import React from "react";

import { localization } from "../../../Localization/localization";
import { ChartTypes } from "../../ChartTypes";
import { FabricStyles } from "../../FabricStyles";
import { JointDataset } from "../../JointDataset";
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
  startingK: number;
  unsortedX: string[];
  unsortedSeries: IGlobalSeries[];
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
      "xaxis.range": [
        this.props.startingK - 0.5,
        this.props.startingK + this.props.topK - 0.5
      ]
    };
    const plotlyProps = this.state.plotlyProps;
    if (plotlyProps) {
      _.set(plotlyProps, "layout.xaxis.range", [
        this.props.startingK - 0.5,
        this.props.startingK + this.props.topK - 0.5
      ]);
    }

    if (
      !this.props.unsortedSeries ||
      this.props.unsortedSeries.length === 0 ||
      !this.props.sortArray ||
      this.props.sortArray.length === 0
    ) {
      return (
        <div className={featureImportanceBarStyles.noData}>
          <Text variant={"xxLarge"}>No data</Text>
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
        responsive: true,
        displayModeBar: false
      },
      data: [],
      layout: {
        autosize: true,
        dragmode: false,
        margin: { t: 10, r: 10, b: 30, l: 0 },
        hovermode: "closest",
        xaxis: {
          automargin: true,
          color: FabricStyles.chartAxisColor,
          tickfont: {
            family: "Roboto, Helvetica Neue, sans-serif",
            size: 11,
            color: FabricStyles.chartAxisColor
          },
          showgrid: false
        },
        yaxis: {
          automargin: true,
          color: FabricStyles.chartAxisColor,
          tickfont: {
            family: "Roboto, Helvetica Neue, sans-serif",
            size: 11,
            color: FabricStyles.chartAxisColor
          },
          zeroline: true,
          showgrid: true,
          gridcolor: "#e5e5e5"
        },
        showlegend: false
      }
    };

    const xText = sortedIndexVector.map((i) => this.props.unsortedX[i]);
    if (this.props.chartType === ChartTypes.Bar) {
      baseSeries.layout.barmode = "group";
      let hovertemplate = this.props.unsortedSeries[0].unsortedFeatureValues
        ? "%{text}: %{customdata.Yvalue}<br>"
        : localization.Charts.featurePrefix + ": %{text}<br>";
      hovertemplate +=
        localization.Charts.importancePrefix + ": %{customdata.Yformatted}<br>";
      hovertemplate += "%{customdata.Name}<br>";
      hovertemplate += "<extra></extra>";

      const x = sortedIndexVector.map((_, index) => index);

      this.props.unsortedSeries.forEach((series, seriesIndex) => {
        baseSeries.data.push({
          hoverinfo: "all",
          orientation: "v",
          type: "bar",
          name: series.name,
          customdata: sortedIndexVector.map((index) => {
            return {
              Name: series.name,
              Yformatted: series.unsortedAggregateY[index].toLocaleString(
                undefined,
                {
                  maximumFractionDigits: 3
                }
              ),
              Yvalue: series.unsortedFeatureValues
                ? series.unsortedFeatureValues[index]
                : undefined
            };
          }),
          text: xText,
          x,
          y: sortedIndexVector.map((index) => series.unsortedAggregateY[index]),
          marker: {
            color: sortedIndexVector.map((index) =>
              index === this.props.selectedFeatureIndex &&
              seriesIndex === this.props.selectedSeriesIndex
                ? FabricStyles.fabricColorPalette[series.colorIndex]
                : FabricStyles.fabricColorPalette[series.colorIndex]
            )
          },
          hovertemplate
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
        console.log(x, y);
        baseSeries.data.push({
          type: "box",
          boxmean: true,
          name: series.name,
          x,
          y,
          marker: {
            color: FabricStyles.fabricColorPalette[series.colorIndex]
          }
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
