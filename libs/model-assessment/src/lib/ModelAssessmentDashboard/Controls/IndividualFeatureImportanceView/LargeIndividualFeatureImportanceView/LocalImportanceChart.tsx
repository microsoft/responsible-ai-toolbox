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
  onWeightChange: (option: WeightVectorOption) => void;
}

export interface ILocalImportanceChartState {
  sortAbsolute: boolean;
  sortedData: Array<number[]>;
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

  // public componentDidMount(): void {
  //   this.generateSortedData();
  // }

  public componentDidUpdate(prevProps: ILocalImportanceChartProps): void {
    if (this.props.data !== prevProps.data) {
      this.generateSortedData();
    }
  }

  public render(): React.ReactNode {
    const classNames = localImportanceChartStyles();
    console.log("!!weightLabels: ", this.props.weightLabels);
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
        <Stack.Item className={classNames.localImportanceLegend}>
          <Stack horizontal={false} tokens={{ childrenGap: "m1" }}>
            <Stack.Item className={classNames.absoluteValueToggle}>
              <Toggle
                label={localization.Interpret.GlobalTab.absoluteValues}
                inlineLabel
                checked={this.state.sortAbsolute}
                onChange={this.toggleSortAbsolute}
              />
            </Stack.Item>
            <Stack.Item>
              <ClassImportanceWeights
                onWeightChange={this.onWeightChange}
                selectedWeightVector={this.props.selectedWeightVector}
                weightOptions={this.props.weightOptions}
                weightLabels={this.props.weightLabels}
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
    console.log("!!weiLa: ", weightValues);
    let sortedData = [];
    sortedData.push(this.getAverageAbsoluteValues());
    sortedData.push(...this.addScores());
    this.setState({ sortedData: sortedData });
    console.log("!!sortedData: ", sortedData);
  }

  private getAverageAbsoluteValues(): void {
    console.log(
      "!!getAverageAbsoluteValues: ",
      this.props.data?.precomputedExplanations?.localFeatureImportance
        .scores[0][0]
    );
    const sortedScores =
      this.props.data?.precomputedExplanations?.localFeatureImportance.scores[0][0].map(
        (score: any) => Math.abs(score)
      );
    console.log("!!res: ", sortedScores);
    return sortedScores;
  }

  private addScores(): any {
    console.log(
      "!!sortedData: ",
      this.props.data?.precomputedExplanations?.localFeatureImportance
        .scores[0],
      typeof this.props.data?.precomputedExplanations?.localFeatureImportance
        .scores[0]
    );
    let scores: number[][] = new Array(
      this.props.data?.precomputedExplanations?.localFeatureImportance.scores[0].length
    );
    this.props.data?.precomputedExplanations?.localFeatureImportance.scores.forEach(
      (score: any[]) => {
        scores.push(score[0]);
      }
    );
    // let sortedData: ISortedData[] = [];
    // scores.forEach((sc: any) => {
    //   sortedData.push(sc);
    // });
    console.log("!!addScores: ", scores);
    return scores.filter((s) => s);
  }

  private getLocalImportanceBarOptions(): any {
    const sortedData = this.getSortedData();
    const x = sortedData.map((d) => d.label);
    const y = sortedData.map((d) => d.value);
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
          text: localization.Counterfactuals.WhatIf
            .percentCounterfactualLocalImportance //update this
        }
      }
    };
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
    const localExplanationsData =
      this.state.sortedData[
        this.props.weightLabels[this.props.selectedWeightVector]
      ];
    if (!localExplanationsData) {
      return data;
    }
    this.props.data.precomputedExplanations.globalFeatureImportance.feature_list.forEach(
      (f: any, index: string | number) => {
        data.push({
          label: f,
          value: localExplanationsData[index] || -Infinity
        });
      }
    );
    data.sort((d1, d2) => d2.value - d1.value);
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
