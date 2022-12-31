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
import { SeriesOptionsType } from "highcharts";
import React from "react";

import { forecastingDashboardStyles } from "../ForecastingDashboard.styles";
import { Transformation } from "../Interfaces/Transformation";

import { getForecastPrediction } from "./getForecastPrediction";

export interface IForecastComparisonProps {
  transformations: Map<string, Transformation>;
}

export interface IForecastComparisonState {
  timeSeriesId?: number;
  baselinePrediction?: number[];
  transformationPredictions: Map<string, number[]>;
  selectedTransformations: Set<string>;
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
    this.state = {
      baselinePrediction: undefined,
      selectedTransformations: new Set<string>(),
      transformationPredictions: new Map<string, number[]>()
    };
  }

  public async componentDidMount(): Promise<void> {
    const baselinePrediction = await this.getBaselineForecastPrediction();
    if (baselinePrediction) {
      this.setState({ baselinePrediction });
    }
  }

  public async componentDidUpdate(): Promise<void> {
    // Check if the time series was changed.
    // In that case, we need to update our state accordingly.
    const currentlySelectedTimeSeriesId =
      this.context.baseErrorCohort.cohort.getCohortID();
    if (currentlySelectedTimeSeriesId !== this.state.timeSeriesId) {
      const baselinePrediction = await this.getBaselineForecastPrediction();
      const selectedTransformationsAndPredictions =
        await this.getSelectedForecastPredictions(
          [...this.props.transformations.keys()],
          true
        );
      this.setState({
        baselinePrediction,
        selectedTransformations:
          selectedTransformationsAndPredictions.selectedTransformations,
        timeSeriesId: currentlySelectedTimeSeriesId,
        transformationPredictions:
          selectedTransformationsAndPredictions.transformationPredictions
      });
      return;
    }

    // Check if any new transformations were added.
    // If so, add their corresponding predictions to this.state.transformationPredictions.
    // If we add deletion for transformations we will need to check for transformations
    // that have been removed and delete their corresponding predictions, too.
    const currentTransformations = [...this.props.transformations.keys()];
    const prevTransformations = new Set(
      this.state.transformationPredictions.keys()
    );
    const newlyAddedTransformations = currentTransformations.filter(
      (t) => !prevTransformations.has(t)
    );
    if (newlyAddedTransformations.length > 0) {
      this.addSelectedForecastPredictions(newlyAddedTransformations);
    }
  }

  public render(): React.ReactNode {
    const classNames = forecastingDashboardStyles();

    const indices = this.context.dataset.index;
    if (
      this.context === undefined ||
      indices === undefined ||
      this.state.baselinePrediction === undefined
    ) {
      return;
    }
    const rowIndices = this.context.baseErrorCohort.cohort.filteredData.map(
      (datum) => indices[datum.Index]
    );

    let trueY: SeriesOptionsType[] = [];
    if (
      this.context.dataset.is_forecasting_true_y &&
      this.context.jointDataset.numLabels === 1
    ) {
      trueY = [
        {
          data: orderByTime(
            this.context.baseErrorCohort.cohort.filteredData.map(
              (row) => row[JointDataset.TrueYLabel]
            ),
            rowIndices
          ),
          name: "True Y",
          type: "spline"
        }
      ];
    }
    const seriesData: SeriesOptionsType[] | undefined =
      this.state.baselinePrediction !== undefined
        ? [
            {
              data: orderByTime(this.state.baselinePrediction, rowIndices),
              name: "Baseline Prediction",
              type: "spline"
            },
            ...trueY
          ]
        : undefined;
    this.state.selectedTransformations.forEach((transformationName) => {
      const preds =
        this.state.transformationPredictions.get(transformationName);
      if (seriesData && preds) {
        seriesData.push({
          data: orderByTime(preds, rowIndices),
          name: transformationName,
          type: "spline"
        } as SeriesOptionsType);
      }
    });

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
                  text: "Forecasts"
                },
                xAxis: {
                  dateTimeLabelFormats: {
                    // don't display the year
                    day: "%e. %b",
                    month: "%b '%y",
                    year: "%Y"
                  },
                  title: {
                    text: "Time"
                  },
                  type: "datetime"
                },
                yAxis: {
                  title: {
                    text: "Target"
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
    number[] | undefined
  > => {
    return await getForecastPrediction(
      this.context.baseErrorCohort.cohort,
      this.context.jointDataset,
      this.context.requestForecast
    );
  };

  private getSelectedForecastPredictions = async (
    newTransformationNames: string[],
    ignoreExisting?: boolean
  ): Promise<{
    transformationPredictions: Map<string, number[]>;
    selectedTransformations: Set<string>;
  }> => {
    const newTransformationPredictions = await Promise.all(
      newTransformationNames.map(async (newTransformationName) => {
        if (this.context.requestForecast === undefined) {
          return;
        }
        const newTransformation = this.props.transformations.get(
          newTransformationName
        );
        if (newTransformation === undefined) {
          return;
        }

        return await getForecastPrediction(
          newTransformation.cohort.cohort,
          this.context.jointDataset,
          this.context.requestForecast,
          newTransformation
        );
      })
    );

    const newMap = ignoreExisting
      ? new Map<string, number[]>()
      : new Map(this.state.transformationPredictions);
    const newSet = ignoreExisting
      ? new Set<string>()
      : new Set(this.state.selectedTransformations);
    newTransformationNames.forEach((newTransformationName, index) => {
      const newPredictions = newTransformationPredictions[index];
      if (newPredictions !== undefined) {
        newMap.set(newTransformationName, newPredictions);
        newSet.add(newTransformationName);
      }
    });

    return {
      selectedTransformations: newSet,
      transformationPredictions: newMap
    };
  };

  private addSelectedForecastPredictions = async (
    newTransformationNames: string[]
  ): Promise<void> => {
    const selectedTransformationsAndPredictions =
      await this.getSelectedForecastPredictions(newTransformationNames);

    this.setState({
      selectedTransformations:
        selectedTransformationsAndPredictions.selectedTransformations,
      transformationPredictions:
        selectedTransformationsAndPredictions.transformationPredictions
    });
  };
}
