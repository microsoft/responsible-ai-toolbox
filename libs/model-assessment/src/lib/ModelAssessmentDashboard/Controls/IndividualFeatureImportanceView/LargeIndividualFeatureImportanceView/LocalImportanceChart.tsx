// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { getTheme, Stack, Toggle } from "@fluentui/react";
import {
  BasicHighChart,
  defaultModelAssessmentContext,
  getPrimaryChartColor,
  LoadingSpinner,
  MissingParametersPlaceholder,
  ModelAssessmentContext,
  ModelExplanationUtils,
  ModelTypes,
  WeightVectorOption
} from "@responsible-ai/core-ui";
import { ClassImportanceWeights } from "@responsible-ai/interpret";
import { localization } from "@responsible-ai/localization";
import React from "react";
import { localImportanceChartStyles } from "./LocalImportanceChart.styles";

export interface ILocalImportanceChartProps {
  rowNumber?: number;
  data: any;
  theme?: string;
  isLocalExplanationsDataLoading?: boolean;
  localExplanationsErrorMessage?: string;
  selectedWeightVector: WeightVectorOption;
  weightOptions: WeightVectorOption[];
  weightLabels: any;
  modelType: string;
  onWeightChange: (option: WeightVectorOption) => void;
}

export interface ILocalImportanceChartState {
  sortAbsolute: boolean;
  sortedData: Array<{ [key: string]: number[] }>;
}
export interface ILocalImportanceData {
  label: string;
  value: number;
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
      sortedData: new Array(this.props.weightOptions.length)
    };
  }

  public componentDidMount(): void {
    this.generateSortedData();
  }

  public componentDidUpdate(prevProps: ILocalImportanceChartProps): void {
    console.log(
      "!!didUpdate ",
      prevProps.data,
      this.props.data,
      this.props.data !== prevProps.data
    );
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
          {localization.Counterfactuals.localImportanceSelectData}
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
      <Stack horizontal={true} grow tokens={{ childrenGap: "l1" }}>
        <Stack.Item className={classNames.localImportanceChart}>
          {this.props.isLocalExplanationsDataLoading ? (
            <LoadingSpinner label={localization.Counterfactuals.loading} />
          ) : (
            <BasicHighChart
              configOverride={this.getLocalImportanceBarOptions()}
              id={"WhatIfFeatureImportanceBar"}
            />
          )}
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
            <Stack.Item>
              <ClassImportanceWeights
                onWeightChange={this.onWeightChange}
                selectedWeightVector={this.props.selectedWeightVector}
                weightOptions={this.props.weightOptions}
                weightLabels={this.props.weightLabels}
                disabled={this.props.isLocalExplanationsDataLoading}
              />
            </Stack.Item>
          </Stack>
        </Stack.Item>
      </Stack>
    );
  }

  private generateSortedData(): any {
    const weightValues = this.props.weightOptions.map(
      (option) => this.props.weightLabels[option]
    );
    console.log("!!in generateSortedData: ", weightValues);
    let sortedData = [];
    sortedData.push({
      [this.props.weightOptions[0]]: this.getAbsoluteValues(
        this.props.data?.precomputedExplanations?.localFeatureImportance
          .scores[0][0]
      )
    });
    sortedData.push(...this.addScores());
    this.setState({ sortedData: sortedData });
    console.log("!!sortedData: ", sortedData);
  }

  private getAbsoluteValues(values?: number[]): number[] | undefined {
    console.log(
      "!!getAverageAbsoluteValues: ",
      this.props.data?.precomputedExplanations?.localFeatureImportance
        .scores[0][0]
    );
    if (!values) {
      return values;
    }
    const sortedScores = values.map((score: any) => Math.abs(score));
    console.log("!!res: ", sortedScores);
    return sortedScores;
  }

  private addScores(): any {
    let scores: Array<{ [key: string]: number[] }> = new Array(
      this.props.data?.precomputedExplanations?.localFeatureImportance.scores.length
    );
    this.props.data?.precomputedExplanations?.localFeatureImportance.scores.forEach(
      (score: any[], index: number) => {
        scores.push({ [this.props.weightOptions[index + 1]]: score[0] });
      }
    );
    console.log("!!addScores: ", scores);
    return scores.filter((s) => s);
  }

  private getLocalImportanceBarOptions(): any {
    const sortedData = this.getSortedData();
    const x = sortedData.map((d) => d.label);
    const y = sortedData.map((d) => d.value);
    let yAxisLabels: string = localization.Interpret.featureImportance;
    if (this.props.modelType !== ModelTypes.Regression) {
      const weightLabel =
        this.props.weightLabels[this.props.selectedWeightVector];
      yAxisLabels = yAxisLabels.concat(" - ", weightLabel);
    }
    const seriesData = [
      {
        color: getPrimaryChartColor(getTheme()),
        data: y,
        name: ""
      }
    ];
    return {
      chart: {
        type: "column"
      },
      series: seriesData,
      title: {
        text: ""
      },
      xAxis: {
        categories: x
      },
      yAxis: {
        title: {
          text: yAxisLabels
        }
      }
    };
  }

  private findValue(sortedData: any, keyToFind: string): number[] | undefined {
    const sortedDataTemp: Array<{ [key: string]: number[] }> = sortedData;
    let valToReturn: number[] | undefined;
    for (let data of sortedDataTemp) {
      Object.entries(data).find(([key, val]) => {
        if (key === keyToFind.toString()) {
          valToReturn = val;
        }
      });
      if (valToReturn) {
        break;
      }
    }
    return valToReturn;
  }

  private getSortedData(): ILocalImportanceData[] {
    const data: ILocalImportanceData[] = [];
    if (this.props.rowNumber === undefined) {
      return data;
    }

    console.log(
      "!!data: ",
      this.state.sortedData,
      this.props.selectedWeightVector,
      this.props.weightLabels,
      this.props.weightOptions
    );

    const localExplanationsData = this.findValue(
      this.state.sortedData,
      this.props.selectedWeightVector as string
    );

    if (!localExplanationsData) {
      return data;
    }

    const unSortedX =
      this.props.data.precomputedExplanations.globalFeatureImportance
        .feature_list;
    const sortedLocalExplanationsIndices = this.state.sortAbsolute
      ? ModelExplanationUtils.getAbsoluteSortIndices(
          localExplanationsData
        ).reverse()
      : ModelExplanationUtils.getSortIndices(localExplanationsData).reverse();
    const sortedLocalExplanationsData = sortedLocalExplanationsIndices.map(
      (index) => localExplanationsData[index]
    );
    const sortedX = sortedLocalExplanationsIndices.map((i) => unSortedX[i]);
    sortedX.forEach((x: any, index: string | number) => {
      data.push({
        label: x,
        value: sortedLocalExplanationsData[index] || -Infinity
      });
    });
    return data;
  }

  private toggleSortAbsolute = (
    _event: React.MouseEvent<HTMLElement, MouseEvent>,
    checked?: boolean | undefined
  ): void => {
    if (checked !== undefined) {
      // const sortArray = this.getSortedArray(
      //   this.state.sortingSeriesIndex,
      //   checked
      // );
      this.setState({ sortAbsolute: checked });
    }
  };

  private onWeightChange = (option: WeightVectorOption): void => {
    // add logic to update plot
    this.props.onWeightChange(option);
  };
}
