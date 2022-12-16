// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  Stack,
  Text,
  Label,
  IComboBoxOption,
  ComboBox,
  IComboBox
} from "@fluentui/react";
// import { localization } from "@responsible-ai/localization";
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
import { ITransformation } from "../Interfaces/Transformation";

export interface IForecastCompareProps {
  cohortName: string;
  forecasts: Map<string, ITransformation>;
}

export interface IForecastCompareState {
  baselinePrediction: number[] | undefined;
  selectedForecasts: string[];
  selectedPredictions: number[][] | undefined;
}

const stackTokens = {
  childrenGap: "l1"
};

interface IGeneralFilter extends Omit<IFilter, "arg"> {
  arg: any[];
}

export class ForecastCompare extends React.Component<
  IForecastCompareProps,
  IForecastCompareState
> {
  public static contextType = ModelAssessmentContext;
  public context: React.ContextType<typeof ModelAssessmentContext> =
    defaultModelAssessmentContext;

  private _getForecastController: AbortController | undefined;

  public constructor(props: IForecastCompareProps) {
    super(props);
    this.state = {
      baselinePrediction: undefined,
      selectedForecasts: [],
      selectedPredictions: undefined
    };
  }

  public componentDidMount(): void {
    this.getBaselineForecastPrediction();
  }

  public componentDidUpdate(prevProps: IForecastCompareProps): void {
    if (this.props.cohortName !== prevProps.cohortName) {
      this.setState(
        { selectedForecasts: [], selectedPredictions: undefined },
        this.getBaselineForecastPrediction
      );
    }
  }

  public render(): React.ReactNode {
    const classNames = forecastingDashboardStyles();
    // filter indices
    const indices = this.context.dataset.index;
    if (indices === undefined) {
      return;
    }
    const filteredIndices =
      this.context.baseErrorCohort.cohort.filteredData.map(
        (datum) => indices[datum.Index]
      );
    const isValidCohort =
      new Set(filteredIndices).size === filteredIndices.length;

    let chooseErrorMessage = undefined;

    if (this.props.forecasts.size === 0) {
      chooseErrorMessage = "Create one or more forecasts to enable comparison";
    }

    if (!isValidCohort) {
      chooseErrorMessage = "Currently selected time series is not valid.";
    }

    const trueY: SeriesOptionsType[] = this.context.dataset
      .is_forecasting_true_y && this.context.jointDataset.numLabels === 1
      ? [
          {
            data: filteredIndices
              .map((dt, idx) => [
                Date.parse(dt),
                // true_y is guaranteed to be 1-dimensional due to the assertion
                // that numLabels = 1 above.
                (this.context.dataset.true_y as number[])[idx]
              ])
              .sort((objA: number[], objB: number[]) => objA[0] - objB[0]),
            name: "True Y",
            type: "spline"
          }
        ]
      : [];
    const seriesData: SeriesOptionsType[] | undefined =
      this.state.baselinePrediction !== undefined &&
      this.state.selectedPredictions !== undefined
        ? [
            {
              data: this.state.baselinePrediction.map((predictedValue, idx) =>
                [Date.parse(filteredIndices[idx]), predictedValue].sort(
                  (objA, objB) => objA[0] - objB[0]
                )
              ),
              name: "Baseline Prediction Y",
              type: "spline"
            },
            ...this.state.selectedForecasts.map((forecastName, idx) => {
              return {
                data: this.state.selectedPredictions![idx].map(
                  (predictedValue, idx) =>
                    [Date.parse(filteredIndices[idx]), predictedValue].sort(
                      (objA, objB) => objA[0] - objB[0]
                    )
                ),
                name: forecastName,
                type: "spline"
              } as SeriesOptionsType;
            }),
            ...trueY
          ]
        : undefined;

    return (
      <Stack tokens={stackTokens}>
        <Stack.Item>
          <Text className={classNames.mediumText}>
            Compare What-if Forecasts
          </Text>
        </Stack.Item>
        <Stack.Item>
          <Stack horizontal tokens={stackTokens}>
            <Stack.Item>
              <Label>Select forecast scenarios</Label>
              <ComboBox
                options={[...this.props.forecasts.keys()].map(
                  (forecastName) => {
                    return {
                      key: forecastName,
                      text: forecastName
                    } as IComboBoxOption;
                  }
                )}
                placeholder={"Choose scenario(s)"}
                multiSelect
                errorMessage={chooseErrorMessage}
                disabled={this.props.forecasts.size === 0 || !isValidCohort}
                selectedKey={this.state.selectedForecasts}
                className={classNames.smallDropdown}
                onChange={this.onChangeSelectedForecasts}
              />
            </Stack.Item>
          </Stack>
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
                subtitle: {
                  text: "What-if scenarios for base and other predictions"
                },
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

  private onChangeSelectedForecasts = (
    _event: React.FormEvent<IComboBox>,
    item?: IComboBoxOption
  ): void => {
    if (item && item.selected !== undefined) {
      const selectedForecast = item.key.toString();
      if (
        item.selected &&
        !this.state.selectedForecasts.includes(selectedForecast)
      ) {
        this.setState(
          {
            selectedForecasts: [
              ...this.state.selectedForecasts,
              selectedForecast
            ],
            selectedPredictions: undefined
          },
          this.getSelectedForecastPredictions
        );
      }
      if (
        !item.selected &&
        this.state.selectedForecasts.includes(selectedForecast)
      ) {
        this.setState(
          {
            selectedForecasts: this.state.selectedForecasts.filter(
              (presentForecast: string) => presentForecast !== selectedForecast
            ),
            selectedPredictions: undefined
          },
          this.getSelectedForecastPredictions
        );
      }
    }
  };

  private readonly getBaselineForecastPrediction = async (): Promise<void> => {
    if (this.context.requestForecast === undefined) {
      return;
    }

    const [filtersRelabeled, compositeFiltersRelabeled] = this.convertFilters(
      this.context.baseErrorCohort.cohort.filters,
      this.context.baseErrorCohort.cohort.compositeFilters,
      this.context.baseErrorCohort.jointDataset
    );

    if (this._getForecastController) {
      this._getForecastController.abort();
    }
    this._getForecastController = new AbortController();
    const baselinePrediction = await this.context.requestForecast(
      [filtersRelabeled, compositeFiltersRelabeled, []],
      this._getForecastController.signal
    );
    this.setState({
      baselinePrediction
    });
  };

  private getSelectedForecastPredictions = async (): Promise<void> => {
    if (this.context.requestForecast === undefined) {
      return;
    }
    const forecasts = this.state.selectedForecasts.map((forecastName) =>
      this.props.forecasts.get(forecastName)
    );
    if (this._getForecastController) {
      this._getForecastController.abort();
    }
    this._getForecastController = new AbortController();
    const selectedPredictions = await Promise.all(
      forecasts.map((forecast) => {
        const [filtersRelabeled, compositeFiltersRelabeled] =
          this.convertFilters(
            forecast!.cohort.filterList,
            forecast!.cohort.compositeFilterList,
            this.context.baseErrorCohort.jointDataset
          );

        return this.context.requestForecast!(
          [
            filtersRelabeled,
            compositeFiltersRelabeled,
            //change this to be iterative
            [[forecast!.operation, forecast!.feature, forecast!.value]]
          ],
          this._getForecastController!.signal
        );
      })
    );
    this.setState({
      selectedPredictions
    });
  };

  private convertFilters = (
    filters: IFilter[],
    compositeFilters: ICompositeFilter[],
    jointDataset: JointDataset
  ): [IFilter[], ICompositeFilter[]] => {
    const categoricalTransformedFilters = this.convertFilterArguments(
      filters,
      jointDataset
    );

    const categoricalTransformedCompositeFilters =
      this.convertCompositeFilterArguments(compositeFilters, jointDataset);

    const filtersRelabeled = Cohort.getLabeledFilters(
      categoricalTransformedFilters,
      jointDataset
    );

    const compositeFiltersRelabeled = Cohort.getLabeledCompositeFilters(
      categoricalTransformedCompositeFilters,
      jointDataset
    );

    return [filtersRelabeled, compositeFiltersRelabeled];
  };

  private convertFilterArguments = (
    filters: IFilter[],
    jointDataset: JointDataset
  ): IFilter[] => {
    return filters.map((filter) => {
      if (jointDataset.metaDict[filter.column].treatAsCategorical) {
        const args = filter.arg.map(
          (a) =>
            jointDataset.metaDict[filter.column].sortedCategoricalValues![a]
        );
        return {
          arg: args,
          column: filter.column,
          method: filter.method
        } as IGeneralFilter;
      }
      return filter as IGeneralFilter;
    });
  };

  private convertCompositeFilterArguments = (
    compositeFilters: ICompositeFilter[],
    jointDataset: JointDataset
  ): ICompositeFilter[] => {
    const categoricalArgumentFilters = compositeFilters.map(
      (compositeFilter) => {
        if (compositeFilter.method) {
          return this.convertFilterArguments(
            [compositeFilter as IFilter],
            jointDataset
          )[0] as ICompositeFilter;
        }
        return {
          compositeFilters: this.convertCompositeFilterArguments(
            compositeFilter.compositeFilters,
            jointDataset
          ),
          operation: compositeFilter.operation
        } as ICompositeFilter;
      }
    );
    return categoricalArgumentFilters;
  };
}
