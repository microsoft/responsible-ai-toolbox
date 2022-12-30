// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Stack, Text } from "@fluentui/react";
import {
  ModelAssessmentContext,
  defaultModelAssessmentContext,
  BasicHighChart,
  JointDataset,
  ICompositeFilter,
  IFilter,
  Cohort
} from "@responsible-ai/core-ui";
import { SeriesOptionsType } from "highcharts";
import React from "react";

import { forecastingDashboardStyles } from "../ForecastingDashboard.styles";
import { Transformation } from "../Interfaces/Transformation";

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

interface TimeBasedValue {
  time: number;
  value: number;
}

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
      transformationPredictions: new Map<string, number[]>(),
      selectedTransformations: new Set<string>()
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
          Array.from(this.props.transformations.keys()),
          true
        );
      this.setState({
        baselinePrediction,
        timeSeriesId: currentlySelectedTimeSeriesId,
        selectedTransformations:
          selectedTransformationsAndPredictions.selectedTransformations,
        transformationPredictions:
          selectedTransformationsAndPredictions.transformationPredictions
      });
      return;
    }

    // Check if any new transformations were added.
    // If so, add their corresponding predictions to this.state.transformationPredictions.
    // If we add deletion for transformations we will need to check for transformations
    // that have been removed and delete their corresponding predictions, too.
    const currentTransformations = Array.from(
      this.props.transformations.keys()
    );
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

    // TODO: find out when this would ever not be the case - what does "invalid cohort" even mean?
    const indices = this.context.dataset.index;
    if (
      this.context === undefined ||
      indices === undefined ||
      this.state.baselinePrediction === undefined
    ) {
      return <React.Fragment />;
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
          data: this.orderByTime(
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
    let seriesData: SeriesOptionsType[] | undefined =
      this.state.baselinePrediction !== undefined
        ? [
            {
              data: this.orderByTime(this.state.baselinePrediction, rowIndices),
              name: "Baseline Prediction Y",
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
          data: this.orderByTime(preds, rowIndices),
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
                // subtitle: {
                //   text: "What-if scenarios for base and other predictions"
                // },
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

  private orderByTime(values: number[], rowIndices: string[]) {
    return values
      .map((predictedValue: number, idx: number) => {
        return {
          time: Date.parse(rowIndices[idx]),
          value: predictedValue
        } as TimeBasedValue;
      })
      .sort(
        (objA: TimeBasedValue, objB: TimeBasedValue) => objA.time - objB.time
      )
      .map((tbv) => [tbv.time, tbv.value]);
  }

  private readonly getBaselineForecastPrediction = async (): Promise<
    number[] | undefined
  > => {
    if (this.context.requestForecast === undefined) {
      return;
    }

    const [filtersRelabeled, compositeFiltersRelabeled] = this.convertFilters(
      this.context.baseErrorCohort.cohort.filters,
      this.context.baseErrorCohort.cohort.compositeFilters,
      this.context.baseErrorCohort.jointDataset
    );

    const baselinePrediction = await this.context.requestForecast(
      [filtersRelabeled, compositeFiltersRelabeled, []],
      new AbortController().signal
    );
    return baselinePrediction;
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
        const [filtersRelabeled, compositeFiltersRelabeled] =
          this.convertFilters(
            newTransformation.cohort.cohort.filters,
            newTransformation.cohort.cohort.compositeFilters,
            this.context.baseErrorCohort.jointDataset
          );
        const newPredictions = await this.context.requestForecast(
          [
            filtersRelabeled,
            compositeFiltersRelabeled,
            [
              newTransformation.operation.key,
              newTransformation.feature.key,
              newTransformation.value
            ]
          ],
          new AbortController().signal
        );
        return newPredictions;
      })
    );

    let newMap = ignoreExisting
      ? new Map<string, number[]>()
      : new Map(this.state.transformationPredictions);
    let newSet = ignoreExisting
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
      transformationPredictions: newMap,
      selectedTransformations: newSet
    };
  };

  private addSelectedForecastPredictions = async (
    newTransformationNames: string[]
  ): Promise<void> => {
    const selectedTransformationsAndPredictions =
      await this.getSelectedForecastPredictions(newTransformationNames);

    this.setState({
      transformationPredictions:
        selectedTransformationsAndPredictions.transformationPredictions,
      selectedTransformations:
        selectedTransformationsAndPredictions.selectedTransformations
    });
  };

  private convertFilters = (
    filters: IFilter[],
    compositeFilters: ICompositeFilter[],
    jointDataset: JointDataset
  ): [IFilter[], ICompositeFilter[]] => {
    // const categoricalTransformedFilters = this.convertFilterArguments(
    //   filters,
    //   jointDataset
    // );

    // const categoricalTransformedCompositeFilters =
    //   this.convertCompositeFilterArguments(compositeFilters, jointDataset);

    const filtersRelabeled = Cohort.getLabeledFilters(filters, jointDataset);

    const compositeFiltersRelabeled = Cohort.getLabeledCompositeFilters(
      compositeFilters,
      jointDataset
    );

    return [filtersRelabeled, compositeFiltersRelabeled];
  };

  // private convertFilterArguments = (
  //   filters: IFilter[],
  //   jointDataset: JointDataset
  // ): IFilter[] => {
  //   return filters.map((filter) => {
  //     if (jointDataset.metaDict[filter.column].treatAsCategorical) {
  //       const args = filter.arg.map(
  //         (a) =>
  //           jointDataset.metaDict[filter.column].sortedCategoricalValues![a]
  //       );
  //       return {
  //         arg: args,
  //         column: filter.column,
  //         method: filter.method
  //       } as IGeneralFilter;
  //     }
  //     return filter as IGeneralFilter;
  //   });
  // };

  // private convertCompositeFilterArguments = (
  //   compositeFilters: ICompositeFilter[],
  //   jointDataset: JointDataset
  // ): ICompositeFilter[] => {
  //   const categoricalArgumentFilters = compositeFilters.map(
  //     (compositeFilter) => {
  //       if (compositeFilter.method) {
  //         return this.convertFilterArguments(
  //           [compositeFilter as IFilter],
  //           jointDataset
  //         )[0] as ICompositeFilter;
  //       }
  //       return {
  //         compositeFilters: this.convertCompositeFilterArguments(
  //           compositeFilter.compositeFilters,
  //           jointDataset
  //         ),
  //         operation: compositeFilter.operation
  //       } as ICompositeFilter;
  //     }
  //   );
  //   return categoricalArgumentFilters;
  // };
}
