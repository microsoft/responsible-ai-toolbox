// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Stack, Text } from "@fluentui/react";
import {
  ModelAssessmentContext,
  defaultModelAssessmentContext,
  BasicHighChart,
  JointDataset,
  orderByTime
} from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";
import { SeriesOptionsType } from "highcharts";
import React from "react";

import { forecastingDashboardStyles } from "../ForecastingDashboard.styles";

import { getForecastPrediction } from "./getForecastPrediction";

export class IForecastComparisonProps {}

export interface IForecastComparisonState {
  timeSeriesId?: number;
  baselinePrediction?: [number, number][];
  trueY?: [number, number][];
}

const stackTokens = {
  childrenGap: "l1"
};

export class ForecastComparison extends React.Component<
  IForecastComparisonProps,
  IForecastComparisonState
> {
  public static contextType = ModelAssessmentContext;
  public context: React.ContextType<typeof ModelAssessmentContext> =
    defaultModelAssessmentContext;

  public constructor(props: IForecastComparisonProps) {
    super(props);
    this.state = {};
  }

  public async componentDidMount(): Promise<void> {
    const trueY = this.getTrueY();
    const baselinePrediction = await this.getBaselineForecastPrediction();
    if (baselinePrediction) {
      this.setState({ baselinePrediction, trueY });
    }
  }

  public async componentDidUpdate(): Promise<void> {
    // Check if the time series was changed.
    // In that case, we need to update our state accordingly.
    const currentlySelectedTimeSeriesId =
      this.context.baseErrorCohort.cohort.getCohortID();
    if (currentlySelectedTimeSeriesId !== this.state.timeSeriesId) {
      const trueY = this.getTrueY();
      const baselinePrediction = await this.getBaselineForecastPrediction();
      this.setState({
        baselinePrediction,
        trueY,
        timeSeriesId: currentlySelectedTimeSeriesId
      });
    }
  }

  public render(): React.ReactNode {
    const classNames = forecastingDashboardStyles();

    if (
      this.context === undefined ||
      this.context.jointDataset.numLabels !== 1
    ) {
      return;
    }

    let trueY: SeriesOptionsType = {
      data: this.state.trueY,
      name: localization.Forecasting.trueY,
      type: "spline"
    };
    const seriesData: SeriesOptionsType[] = [trueY];
    if (this.state.baselinePrediction !== undefined) {
      seriesData.push({
        data: this.state.baselinePrediction,
        name: localization.Forecasting.baselinePrediction,
        type: "spline"
      } as SeriesOptionsType);
    }

    return (
      <Stack tokens={stackTokens}>
        <Stack.Item>
          <Text className={classNames.mediumText}>
            Compare What-if Forecasts
          </Text>
        </Stack.Item>
        {seriesData !== undefined && (
          <Stack.Item>
            <BasicHighChart
              id={"ForecastScenarioChart"}
              configOverride={{
                chart: {
                  type: "spline"
                },
                legend: {
                  enabled: true
                },
                plotOptions: {
                  series: {
                    marker: {
                      enabled: true,
                      radius: 2.5
                    }
                  }
                },
                series: seriesData,
                title: {
                  text: localization.Forecasting.forecastComparisonChartTitle
                },
                xAxis: {
                  title: {
                    text: localization.Forecasting
                      .forecastComparisonChartTimeAxisLabel
                  },
                  type: "datetime"
                },
                yAxis: {
                  title: {
                    text: localization.Forecasting.target
                  }
                }
              }}
            />
          </Stack.Item>
        )}
      </Stack>
    );
  }

  private readonly getBaselineForecastPrediction = async (): Promise<
    [number, number][] | undefined
  > => {
    const baselinePrediction = await getForecastPrediction(
      this.context.baseErrorCohort.cohort,
      this.context.jointDataset,
      this.context.requestForecast
    );
    if (
      baselinePrediction === undefined ||
      this.context.dataset.index === undefined
    ) {
      return undefined;
    }
    const dataIndex = this.context.dataset.index!;
    return orderByTime(baselinePrediction, this.getIndices(dataIndex));
  };

  private readonly getTrueY = (): [number, number][] | undefined => {
    if (this.context.dataset.index === undefined) {
      return undefined;
    }
    const dataIndex = this.context.dataset.index!;
    return orderByTime(
      this.context.baseErrorCohort.cohort.filteredData.map(
        (row) => row[JointDataset.TrueYLabel]
      ),
      this.getIndices(dataIndex)
    );
  };

  private readonly getIndices = (dataIndex: string[]): string[] => {
    return this.context.baseErrorCohort.cohort.filteredData.map(
      (datum) => dataIndex[datum.Index]
    );
  };
}
