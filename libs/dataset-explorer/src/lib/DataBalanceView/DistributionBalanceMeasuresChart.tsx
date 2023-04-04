// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Stack, getTheme } from "@fluentui/react";
import {
  BasicHighChart,
  HeaderWithInfo,
  IDistributionBalanceMeasures,
  IHighchartsConfig,
  MissingParametersPlaceholder
} from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";
import {
  SeriesOptionsType,
  XAxisOptions,
  YAxisOptions,
  SeriesLegendItemClickEventObject
} from "highcharts";
import React from "react";

import { DistributionBalanceMeasuresMap } from "./getDistributionBalanceMeasuresChart";

export interface IDistributionBalanceMeasuresProps {
  distributionBalanceMeasures?: IDistributionBalanceMeasures;
}

export interface IDistributionBalanceMeasuresState {
  visibleMeasures: string[];
  // The key is the concatenation of the visible measure names.
  // A change to the key will cause the chart to be redrawn.
  visibleMeasuresKey: string;
}

export class DistributionBalanceMeasuresChart extends React.PureComponent<
  IDistributionBalanceMeasuresProps,
  IDistributionBalanceMeasuresState
> {
  private static readonly INFO_ICON = "&#9432;";

  public constructor(props: IDistributionBalanceMeasuresProps) {
    super(props);

    const measuresLocalization =
      localization.ModelAssessment.DataBalance.DistributionBalanceMeasures
        .Measures;

    const visibleMeasures = [
      measuresLocalization.JSDistance.Name,
      measuresLocalization.InfiniteNormDistance.Name,
      measuresLocalization.WassersteinDistance.Name,
      measuresLocalization.ChiSquareStatistic.Name
    ];

    this.state = {
      visibleMeasures,
      visibleMeasuresKey: visibleMeasures.join("")
    };
  }

  public render(): React.ReactNode {
    const distributionBalanceMeasures = this.props.distributionBalanceMeasures;

    const measuresLocalization =
      localization.ModelAssessment.DataBalance.DistributionBalanceMeasures;

    const headerWithInfo = (
      <HeaderWithInfo
        title={measuresLocalization.Name}
        calloutTitle={measuresLocalization.Callout.Title}
        calloutDescription={measuresLocalization.Callout.Description}
        calloutLink="https://github.com/microsoft/responsible-ai-toolbox/blob/main/docs/databalance-README.md#distribution-balance-measures"
        calloutLinkText={localization.ModelAssessment.DataBalance.LearnMore}
        id="distributionBalanceMeasuresHeader"
      />
    );

    if (!distributionBalanceMeasures) {
      return (
        <>
          {headerWithInfo}
          <MissingParametersPlaceholder>
            {measuresLocalization.MeasuresNotComputed}
          </MissingParametersPlaceholder>
        </>
      );
    }

    return (
      <Stack tokens={{ childrenGap: "l1" }} id="distributionBalanceMeasures">
        <Stack.Item>{headerWithInfo}</Stack.Item>

        <Stack.Item>
          <BasicHighChart
            configOverride={this.getDistributionBalanceMeasuresChart(
              distributionBalanceMeasures,
              this.state.visibleMeasures
            )}
            key={this.state.visibleMeasuresKey}
          />
        </Stack.Item>
      </Stack>
    );
  }

  // This is an instance method because an update to the legend triggers an update to the state.
  private getDistributionBalanceMeasuresChart(
    distributionBalanceMeasures: IDistributionBalanceMeasures,
    visibleMeasures: string[]
  ): IHighchartsConfig {
    if (
      !distributionBalanceMeasures ||
      Object.keys(distributionBalanceMeasures).length === 0
    ) {
      return {};
    }

    const chartLocalization =
      localization.ModelAssessment.DataBalance.DistributionBalanceMeasures
        .Chart;

    const features = Object.keys(distributionBalanceMeasures);

    // Since each measure has its own range of values, it can be its own subplot and
    // therefore it has its own series, x-axis, and y-axis.
    const multipleSeries: SeriesOptionsType[] = [];
    const xAxes: XAxisOptions[] = [];
    const yAxes: YAxisOptions[] = [];

    // Calculate the width of each subplot and the padding between each subplot
    const width = 100 / visibleMeasures.length;
    const padding = 5;

    // Represents axis.left for each subplot, meaning at which point from the left to start the subplot
    let axisLeftStart = 0;

    [...DistributionBalanceMeasuresMap.entries()].forEach(
      ([measureName, measureInfo], i) => {
        const measureValues = features.map(
          (feature) => distributionBalanceMeasures[feature][measureInfo.KeyName]
        );

        const isVisible = visibleMeasures.includes(measureName);

        multipleSeries.push({
          data: measureValues,
          events: {
            // Define an event to re-compute and re-render the chart
            // when the user clicks on the legend to either show or hide a subplot.
            legendItemClick: (e: SeriesLegendItemClickEventObject) =>
              this.onLegendClick(e, visibleMeasures)
          },
          name: measureName,
          type: "column",
          visible: isVisible,
          xAxis: i,
          yAxis: i
        });

        xAxes.push({
          categories: features,
          left: isVisible ? `${axisLeftStart}%` : "0%",
          offset: 0,
          showEmpty: false,
          title: {
            // If user hovers over the title, they are presented with the measure description.
            text: `<div title="${measureInfo.Description}">${measureName} ${DistributionBalanceMeasuresChart.INFO_ICON}</div>`,
            useHTML: true
          },
          width: isVisible ? `${width - padding}%` : "0%"
        });

        yAxes.push({
          left: isVisible ? `${axisLeftStart}%` : "0%",
          offset: 0,
          showEmpty: false,
          title: {
            // Show y-axis label on the leftmost subplot only
            text: i === 0 ? chartLocalization.Axes.MeasureValue : ""
          },
          width: isVisible ? `${width - padding}%` : "0%"
        });

        if (isVisible) {
          axisLeftStart += width;
        }
      }
    );
    const theme = getTheme();

    return {
      chart: {
        backgroundColor: theme.semanticColors.bodyBackground,
        numberFormatter: (value: number): string => value.toFixed(3),
        type: "column"
      },
      legend: {
        enabled: true
      },
      plotOptions: {
        column: {
          colorByPoint: true,
          dataLabels: {
            enabled: true
          },
          grouping: false
        }
      },
      series: multipleSeries,
      title: {
        text: `${chartLocalization.Title1} ${features.join(", ")} ${
          chartLocalization.Title2
        }`
      },
      tooltip: {
        shared: false
      },
      xAxis: xAxes,
      yAxis: yAxes
    };
  }

  private onLegendClick(
    e: SeriesLegendItemClickEventObject,
    visibleMeasures: string[]
  ): void {
    const measure = e.target.name;

    // If the clicked-on chart was a visible measure, that means user clicked to hide it,
    // so remove it from visible measures.
    if (visibleMeasures.includes(measure)) {
      visibleMeasures.splice(visibleMeasures.indexOf(measure), 1);
    } else {
      // Otherwise, the user clicked to show the chart so add it to visible measures.
      visibleMeasures.push(measure);
    }

    // Re-renders the chart with the new visible measures.
    this.setState({
      visibleMeasures,
      visibleMeasuresKey: visibleMeasures.join("")
    });
  }
}
