// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Stack } from "@fluentui/react";
import {
  BasicHighChart,
  HeaderWithInfo,
  IDistributionBalanceMeasures,
  IHighchartsConfig
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
  distributionBalanceMeasures: IDistributionBalanceMeasures;
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
    if (!distributionBalanceMeasures) {
      return;
    }

    const measuresLocalization =
      localization.ModelAssessment.DataBalance.DistributionBalanceMeasures;

    return (
      <Stack tokens={{ childrenGap: "l1" }}>
        <HeaderWithInfo
          title={measuresLocalization.Name}
          calloutTitle={measuresLocalization.Callout.Title}
          calloutDescription={measuresLocalization.Callout.Description}
          // TODO: Replace link with https://responsibleaitoolbox.ai/ link once docs are published there
          calloutLink="https://microsoft.github.io/SynapseML/docs/features/responsible_ai/Data%20Balance%20Analysis/#distribution-balance-measures"
          calloutLinkText={localization.ModelAssessment.DataBalance.LearnMore}
        />

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
      distributionBalanceMeasures === undefined ||
      Object.keys(distributionBalanceMeasures).length === 0
    ) {
      return {};
    }

    const chartLocalization =
      localization.ModelAssessment.DataBalance.DistributionBalanceMeasures
        .Chart;
    const infoIcon = "&#9432;";

    const features = Object.keys(distributionBalanceMeasures);

    // Since each measure has its own range of values, it can be its own subplot and
    // therefore it has its own series, x-axis, and y-axis.
    const multipleSeries: SeriesOptionsType[] = [],
      xAxes: XAxisOptions[] = [],
      yAxes: YAxisOptions[] = [];

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
            text: `<div title="${measureInfo.Description}">${measureName} ${infoIcon}</div>`,
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

    return {
      chart: {
        numberFormatter: (value: number) => value.toFixed(3),
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
    // If the clicked-on chart was a visible measure, that means user clicked to hide it,
    // so remove it from visible measures.
    if (visibleMeasures.includes(e.target.name)) {
      visibleMeasures.splice(visibleMeasures.indexOf(e.target.name), 1);
    } else {
      // Otherwise, the user clicked to show the chart so add it to visible measures.
      visibleMeasures.push(e.target.name);
    }

    // Re-renders the chart with the new visible measures.
    this.setState({
      visibleMeasures,
      visibleMeasuresKey: visibleMeasures.join("")
    });
  }
}
