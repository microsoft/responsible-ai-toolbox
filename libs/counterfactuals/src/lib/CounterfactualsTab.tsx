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
import { counterfactualsTabStyles } from "./CounterfactualsTab.styles";

export interface ICounterfactualsTabProps {
  data: ICounterfactualData;
}
export interface ICounterfactualsTabState {
  cohorts: Cohort[];
  weightVectorOptions: WeightVectorOption[];
  weightVectorLabels: Dictionary<string>;
  selectedWeightVector: WeightVectorOption;
}

export class CounterfactualsTab extends React.PureComponent<
  ICounterfactualsTabProps,
  ICounterfactualsTabState
> {
  public static contextType = ModelAssessmentContext;
  public context: React.ContextType<typeof ModelAssessmentContext> =
    defaultModelAssessmentContext;
  public constructor(props: ICounterfactualsTabProps) {
    super(props);
    this.state = buildCounterfactualState(
      this.context.dataset,
      this.context.jointDataset,
      ModelTypes.Multiclass
    );
  }

  public render(): React.ReactNode {
    const classNames = counterfactualsTabStyles();
    return (
      <Stack grow tokens={{ padding: "l1" }} className={classNames.container}>
        <Stack.Item className={classNames.infoWithText}>
          <Text variant={"medium"}>
            {localization.Counterfactuals.whatifDescription}
          </Text>
        </Stack.Item>
        <Stack.Item>
          <CounterfactualChart
            invokeModel={this.context.requestPredictions}
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
}
