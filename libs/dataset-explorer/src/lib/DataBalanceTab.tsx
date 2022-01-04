// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  defaultModelAssessmentContext,
  MissingParametersPlaceholder,
  ModelAssessmentContext
} from "@responsible-ai/core-ui";
import {
  getAggregateBalanceMeasures,
  getDistributionBalanceMeasures,
  getFeatureBalanceMeasures
} from "libs/core-ui/src/lib/Interfaces/DataBalanceInterfaces";
import { Stack, StackItem } from "office-ui-fabric-react";
import React from "react";

import { dataBalanceTabStyles } from "./DataBalanceTab.styles";

export class IDataBalanceTabProps {}

export interface IDataBalanceTabState {}

export class DataBalanceTab extends React.Component<
  IDataBalanceTabProps,
  IDataBalanceTabState
> {
  public static contextType = ModelAssessmentContext;
  public context: React.ContextType<typeof ModelAssessmentContext> =
    defaultModelAssessmentContext;

  public constructor(props: IDataBalanceTabProps) {
    super(props);

    this.state = {};
  }

  public render(): React.ReactNode {
    const classNames = dataBalanceTabStyles();

    console.log("this.context.dataset:");
    console.log(this.context.dataset);

    if (!this.context.dataset.dataBalanceMeasures) {
      return (
        <MissingParametersPlaceholder>
          {
            "This tab requires the dataset to contain already computed data balance measures." // TODO: Replace with localization
          }
        </MissingParametersPlaceholder>
      );
    }

    console.log("this.context.dataset.dataBalanceMeasures:");
    console.log(this.context.dataset.dataBalanceMeasures);

    return (
      <div className={classNames.page}>
        <h1>Aggregate Balance Measures</h1>
        <Stack>
          <StackItem>
            {`atkinsonIndex --> ${
              getAggregateBalanceMeasures(
                this.context.dataset.dataBalanceMeasures
                  ?.aggregateBalanceMeasures?.measures ?? {}
              ).atkinsonIndex
            }`}
          </StackItem>
          <StackItem>
            {`theilLIndex --> ${
              getAggregateBalanceMeasures(
                this.context.dataset.dataBalanceMeasures
                  ?.aggregateBalanceMeasures?.measures ?? {}
              ).theilLIndex
            }`}
          </StackItem>
          <StackItem>
            {`theilTIndex --> ${
              getAggregateBalanceMeasures(
                this.context.dataset.dataBalanceMeasures
                  ?.aggregateBalanceMeasures?.measures ?? {}
              ).theilTIndex
            }`}
          </StackItem>
        </Stack>
        <h1>Distribution Balance Measures</h1>
        <Stack>
          <StackItem>
            {`race wassersteinDist --> ${
              getDistributionBalanceMeasures(
                this.context.dataset.dataBalanceMeasures
                  ?.distributionBalanceMeasures?.measures ?? {},
                "race"
              ).wassersteinDist
            }`}
          </StackItem>
          <StackItem>
            {`sex jsDist --> ${
              getDistributionBalanceMeasures(
                this.context.dataset.dataBalanceMeasures
                  ?.distributionBalanceMeasures?.measures ?? {},
                "sex"
              ).jsDist
            }`}
          </StackItem>
        </Stack>
        <h1>Feature Balance Measures</h1>
        <Stack>
          <StackItem>
            {`race Other Asian-Pac-Islander dp --> ${
              getFeatureBalanceMeasures(
                this.context.dataset.dataBalanceMeasures?.featureBalanceMeasures
                  ?.measures ?? {},
                "race",
                "Other",
                "Asian-Pac-Islander"
              ).dp
            }`}
          </StackItem>
          <StackItem>
            {`race Asian-Pac-Islander Other dp --> ${
              getFeatureBalanceMeasures(
                this.context.dataset.dataBalanceMeasures?.featureBalanceMeasures
                  ?.measures ?? {},
                "race",
                "Asian-Pac-Islander",
                "Other"
              ).dp
            }`}
          </StackItem>
          <StackItem>
            {`sex Male Female dp --> ${
              getFeatureBalanceMeasures(
                this.context.dataset.dataBalanceMeasures?.featureBalanceMeasures
                  ?.measures ?? {},
                "sex",
                "Male",
                "Female"
              ).dp
            }`}
          </StackItem>
          <StackItem>
            {`sex Female Male dp --> ${
              getFeatureBalanceMeasures(
                this.context.dataset.dataBalanceMeasures?.featureBalanceMeasures
                  ?.measures ?? {},
                "sex",
                "Female",
                "Male"
              ).dp
            }`}
          </StackItem>
        </Stack>
      </div>
    );
  }
}
