// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { getTheme, Slider, Stack, Toggle } from "@fluentui/react";
import {
  BasicHighChart,
  defaultModelAssessmentContext,
  getPrimaryChartColor,
  ILocalExplanations,
  IsClassifier,
  LoadingSpinner,
  MissingParametersPlaceholder,
  ModelAssessmentContext,
  ModelTypes,
  WeightVectorOption
} from "@responsible-ai/core-ui";
import { ClassImportanceWeights } from "@responsible-ai/interpret";
import { localization } from "@responsible-ai/localization";
import { Dictionary } from "lodash";
import React from "react";

import { regressionKeyValue } from "./constants";
import { localImportanceChartStyles } from "./LocalImportanceChart.styles";
import { getSortedData } from "./localImportanceChartUtils";

export interface ILocalImportanceChartProps {
  rowNumber?: number;
  data?: ILocalExplanations;
  theme?: string;
  isLocalExplanationsDataLoading?: boolean;
  localExplanationsErrorMessage?: string;
  selectedWeightVector: WeightVectorOption;
  weightOptions: WeightVectorOption[];
  weightLabels: Dictionary<string>;
  modelType: ModelTypes;
  onWeightChange: (option: WeightVectorOption) => void;
}

export interface ILocalImportanceChartState {
  sortAbsolute: boolean;
  sortedData: Array<{ [key: string]: number[] | number | undefined }>;
  topK: number;
}

export class LocalImportanceChart extends React.PureComponent<
  ILocalImportanceChartProps,
  ILocalImportanceChartState
> {
  public static contextType = ModelAssessmentContext;
  public context: React.ContextType<typeof ModelAssessmentContext> =
    defaultModelAssessmentContext;

  public constructor(props: ILocalImportanceChartProps) {
    super(props);

    this.state = {
      sortAbsolute: true,
      sortedData: new Array(this.props.weightOptions.length),
      topK: 4
    };
  }

  public componentDidMount(): void {
    this.generateSortedData();
  }

  public componentDidUpdate(prevProps: ILocalImportanceChartProps): void {
    if (
      this.props.data !== prevProps.data ||
      (!this.props.isLocalExplanationsDataLoading &&
        this.props.isLocalExplanationsDataLoading !==
          prevProps.isLocalExplanationsDataLoading)
    ) {
      this.generateSortedData();
    }
  }

  public render(): React.ReactNode {
    const classNames = localImportanceChartStyles();
    if (this.props.rowNumber === undefined) {
      return (
        <MissingParametersPlaceholder>
          {localization.Counterfactuals.largeLocalImportanceSelectData}
        </MissingParametersPlaceholder>
      );
    }

    if (this.props.localExplanationsErrorMessage) {
      return (
        <MissingParametersPlaceholder>
          {localization.formatString(
            localization.Counterfactuals.localImportanceFetchError,
            this.props.localExplanationsErrorMessage
          )}
        </MissingParametersPlaceholder>
      );
    }

    return (
      <Stack horizontal grow tokens={{ childrenGap: "l1" }}>
        <Stack.Item className={classNames.localImportanceChart}>
          <Stack horizontal={false} tokens={{ childrenGap: "m1" }}>
            <Stack.Item className={classNames.featureImportanceControls}>
              <Slider
                label={localization.formatString(
                  localization.Interpret.GlobalTab.topAtoB,
                  this.state.topK
                )}
                className={classNames.startingK}
                ariaLabel={
                  localization.Interpret.AggregateImportance.topKFeatures
                }
                max={
                  this.props.data?.precomputedExplanations
                    ?.globalFeatureImportance?.feature_list.length || 1
                }
                min={1}
                step={1}
                value={this.state.topK}
                onChange={this.setTopK}
                showValue={false}
                disabled={this.props.isLocalExplanationsDataLoading}
              />
            </Stack.Item>
            <Stack.Item>
              {this.props.isLocalExplanationsDataLoading ? (
                <LoadingSpinner label={localization.Counterfactuals.loading} />
              ) : (
                <BasicHighChart
                  configOverride={this.getLocalImportanceBarOptions()}
                  id={"WhatIfFeatureImportanceBar"}
                />
              )}
            </Stack.Item>
          </Stack>
        </Stack.Item>
        <Stack.Item>
          <Stack horizontal={false} tokens={{ childrenGap: "m1" }}>
            <Stack.Item className={classNames.absoluteValueToggle}>
              <Toggle
                label={localization.Interpret.GlobalTab.absoluteValues}
                inlineLabel
                checked={this.state.sortAbsolute}
                onChange={this.toggleSortAbsolute}
                disabled={this.props.isLocalExplanationsDataLoading}
              />
            </Stack.Item>
            {IsClassifier(this.props.modelType) && (
              <Stack.Item>
                <ClassImportanceWeights
                  onWeightChange={this.onWeightChange}
                  selectedWeightVector={this.props.selectedWeightVector}
                  weightOptions={this.props.weightOptions}
                  weightLabels={this.props.weightLabels}
                  disabled={this.props.isLocalExplanationsDataLoading}
                />
              </Stack.Item>
            )}
          </Stack>
        </Stack.Item>
      </Stack>
    );
  }

  private setTopK = (newValue: number): void => {
    this.setState({ topK: newValue });
  };

  private generateSortedData(): void {
    const sortedData: Array<{ [key: string]: number[] | number | undefined }> =
      [];
    if (IsClassifier(this.props.modelType)) {
      sortedData.push({
        [this.props.weightOptions[0]]: this.getAbsoluteValues(
          this.props.data?.precomputedExplanations?.localFeatureImportance
            .scores[0][0]
        )
      });
      sortedData.push(...this.addScores());
    } else {
      sortedData.push({
        [regressionKeyValue]:
          this.props.data?.precomputedExplanations?.localFeatureImportance
            .scores[0]
      });
    }

    this.setState({ sortedData });
  }

  private getAbsoluteValues(values?: number[]): number[] | undefined {
    if (!values) {
      return values;
    }
    const sortedScores = values.map((score) => Math.abs(score));
    return sortedScores;
  }

  private addScores(): Array<{ [key: string]: number[] }> {
    const scores: Array<{ [key: string]: number[] }> = new Array(
      this.props.data?.precomputedExplanations?.localFeatureImportance.scores.length
    );
    this.props.data?.precomputedExplanations?.localFeatureImportance.scores.forEach(
      (score, index) => {
        if (score[0]) {
          scores[index] = { [this.props.weightOptions[index + 1]]: score[0] };
        }
      }
    );
    return scores;
  }

  private getLocalImportanceBarOptions(): any {
    const sortedData = getSortedData(
      this.props.selectedWeightVector,
      this.props.modelType,
      this.state.sortedData,
      this.state.sortAbsolute,
      this.props.data?.precomputedExplanations.globalFeatureImportance
        .feature_list,
      this.props.rowNumber
    );
    const x = sortedData.map((d) => d.label);
    const y = sortedData.map((d) => d.value);
    let yAxisLabels: string = localization.Interpret.featureImportance;
    if (this.props.modelType !== ModelTypes.Regression) {
      const weightLabel =
        this.props.weightLabels[this.props.selectedWeightVector];
      yAxisLabels = yAxisLabels.concat(" - ", weightLabel);
    }
    const theme = getTheme();
    const seriesData = [
      {
        color: getPrimaryChartColor(theme),
        data: y,
        name: ""
      }
    ];
    return {
      chart: {
        backgroundColor: theme.semanticColors.bodyBackground,
        type: "column"
      },
      series: seriesData,
      xAxis: {
        categories: x,
        max: this.state.topK - 1
      },
      yAxis: {
        title: {
          text: yAxisLabels
        }
      }
    };
  }

  private toggleSortAbsolute = (
    _event: React.MouseEvent<HTMLElement, MouseEvent>,
    checked?: boolean | undefined
  ): void => {
    if (checked !== undefined) {
      this.setState({ sortAbsolute: checked });
    }
  };

  private onWeightChange = (option: WeightVectorOption): void => {
    this.props.onWeightChange(option);
  };
}
