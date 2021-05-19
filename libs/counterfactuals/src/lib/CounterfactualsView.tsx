// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  Cohort,
  defaultModelAssessmentContext,
  ICausalAnalysisData,
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
  data: ICausalAnalysisData;
}
export interface ICounterfactualsViewState {
  selectedIndex?: number;
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
      <Stack grow tokens={{ padding: "16px 24px" }}>
        <Stack.Item>
          <Text variant={"medium"}>
            {localization.Counterfactuals.whatifDescription}
          </Text>
        </Stack.Item>
        <Stack.Item>
          <CounterfactualChart
            selectedWeightVector={this.state.selectedWeightVector}
            weightOptions={this.state.weightVectorOptions}
            weightLabels={this.state.weightVectorLabels}
            onWeightChange={this.onWeightVectorChange}
          />
        </Stack.Item>
        <Stack.Item>
          <div>{this.state.selectedIndex}</div>
        </Stack.Item>
      </Stack>
    );
  }

  private onWeightVectorChange = (weightOption: WeightVectorOption): void => {
    this.context.jointDataset.buildLocalFlattenMatrix(weightOption);
    this.state.cohorts.forEach((cohort) => cohort.clearCachedImportances());
    this.setState({ selectedWeightVector: weightOption });
  };
}
