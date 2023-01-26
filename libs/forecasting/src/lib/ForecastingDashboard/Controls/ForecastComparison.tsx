// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Stack, Text } from "@fluentui/react";
import {
  ModelAssessmentContext,
  defaultModelAssessmentContext,
  BasicHighChart,
  JointDataset,
  orderByTime,
  featureColumnsExist
} from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";
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
  baselinePrediction?: Array<[number, number]>;
  trueY?: Array<[number, number]>;
  transformationPredictions: Map<string, Array<[number, number]>>;
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
      transformationPredictions: new Map<string, Array<[number, number]>>()
    };
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
          selectedTransformationsAndPredictions.transformationPredictions,
        trueY
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

    if (
      this.context === undefined ||
      this.context.jointDataset.numLabels !== 1
    ) {
      return;
    }

    const trueY: SeriesOptionsType = {
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
    this.state.selectedTransformations.forEach((transformationName) => {
      const transformationPredictions =
        this.state.transformationPredictions.get(transformationName);
      if (transformationPredictions) {
        seriesData.push({
          data: transformationPredictions,
          name: transformationName,
          type: "spline"
        } as SeriesOptionsType);
      }
    });

    const whatIfEnabled = featureColumnsExist(
      this.context.dataset.feature_names,
      this.context.dataset.feature_metadata
    );

    return (
      <Stack tokens={stackTokens}>
        {whatIfEnabled && (
          <Stack.Item>
            <Text className={classNames.mediumText}>
              {localization.Forecasting.forecastComparisonHeader}
            </Text>
          </Stack.Item>
        )}
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
    Array<[number, number]> | undefined
  > => {
    const baselinePrediction = await getForecastPrediction(
      this.context.baseErrorCohort.cohort,
      this.context.jointDataset,
      this.context.requestForecast
    );
    if (baselinePrediction && this.context.dataset.index) {
      const dataIndex = this.context.dataset.index;
      return orderByTime(baselinePrediction, this.getIndices(dataIndex));
    }
    return undefined;
  };

  private getSelectedForecastPredictions = async (
    newTransformationNames: string[],
    ignoreExisting?: boolean
  ): Promise<{
    transformationPredictions: Map<string, Array<[number, number]>>;
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

        const pred = await getForecastPrediction(
          newTransformation.cohort.cohort,
          this.context.jointDataset,
          this.context.requestForecast,
          newTransformation
        );
        if (pred && this.context.dataset.index) {
          return orderByTime(pred, this.getIndices(this.context.dataset.index));
        }
        return undefined;
      })
    );

    const newMap = ignoreExisting
      ? new Map<string, Array<[number, number]>>()
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

  private readonly getTrueY = (): Array<[number, number]> | undefined => {
    if (this.context.dataset.index) {
      return orderByTime(
        this.context.baseErrorCohort.cohort.filteredData.map(
          (row) => row[JointDataset.TrueYLabel]
        ),
        this.getIndices(this.context.dataset.index)
      );
    }
    return undefined;
  };

  private readonly getIndices = (dataIndex: string[]): string[] => {
    return this.context.baseErrorCohort.cohort.filteredData.map(
      (datum) => dataIndex[datum.Index]
    );
  };
}
