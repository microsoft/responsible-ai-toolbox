// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  Cohort,
  defaultModelAssessmentContext,
  ICounterfactualData,
  ModelAssessmentContext,
  ModelTypes,
  WeightVectorOption
} from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";
import { Dictionary } from "lodash";
import { Stack, Text } from "office-ui-fabric-react";
import React from "react";

import { buildCounterfactualState } from "./buildCounterfactualState";
import { CounterfactualChart } from "./CounterfactualChart";

export interface ICounterfactualsViewProps {
  classDimension?: 1 | 2 | 3;
  data: ICounterfactualData;
}
export interface ICounterfactualsViewState {
  cohorts: Cohort[];
  weightVectorOptions: WeightVectorOption[];
  weightVectorLabels: Dictionary<string>;
  selectedWeightVector: WeightVectorOption;
}

export class CounterfactualsView extends React.PureComponent<
  ICounterfactualsViewProps,
  ICounterfactualsViewState
> {
  public static contextType = ModelAssessmentContext;
  public context: React.ContextType<
    typeof ModelAssessmentContext
  > = defaultModelAssessmentContext;
  public constructor(props: ICounterfactualsViewProps) {
    super(props);
    this.state = buildCounterfactualState(
      this.context.dataset,
      this.context.jointDataset,
      ModelTypes.Multiclass
    );
  }

  public render(): React.ReactNode {
    return (
      <Stack grow tokens={{ padding: "16px 0" }}>
        <Stack.Item>
          <Text variant={"medium"}>
            {localization.Counterfactuals.whatifDescription}
          </Text>
        </Stack.Item>
        <Stack.Item>
          <CounterfactualChart
            invokeModel={this.requestPredictions}
            data={this.props.data}
            selectedWeightVector={this.state.selectedWeightVector}
            weightOptions={this.state.weightVectorOptions}
            weightLabels={this.state.weightVectorLabels}
            onWeightChange={this.onWeightVectorChange}
          />
        </Stack.Item>
      </Stack>
    );
  }

  private onWeightVectorChange = (weightOption: WeightVectorOption): void => {
    this.context.jointDataset.buildLocalFlattenMatrix(weightOption);
    this.state.cohorts.forEach((cohort) => cohort.clearCachedImportances());
    this.setState({ selectedWeightVector: weightOption });
  };

  private requestPredictions = (
    data: any[],
    signal: AbortSignal
  ): Promise<any[]> => {
    return !this.props.classDimension || this.props.classDimension === 1
      ? this.generateRandomScore(data, signal)
      : this.generateRandomProbs(this.props.classDimension, data, signal);
  };

  private generateRandomScore = (
    data: any[],
    signal: AbortSignal
  ): Promise<any[]> => {
    const promise = new Promise<any>((resolve, reject) => {
      const timeout = setTimeout(() => {
        resolve(data.map(() => Math.random()));
      }, 300);
      signal.addEventListener("abort", () => {
        clearTimeout(timeout);
        reject(new DOMException("Aborted", "AbortError"));
      });
    });

    return promise;
  };

  private generateRandomProbs(
    classDimensions: 2 | 3,
    data: any[],
    signal: AbortSignal
  ): Promise<any[]> {
    const promise = new Promise<any[]>((resolve, reject) => {
      const timeout = setTimeout(() => {
        resolve(
          data.map(() =>
            Array.from({ length: classDimensions }, () => Math.random())
          )
        );
      }, 300);
      signal.addEventListener("abort", () => {
        clearTimeout(timeout);
        reject(new DOMException("Aborted", "AbortError"));
      });
    });

    return promise;
  }
}
