// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  defaultModelAssessmentContext,
  MissingParametersPlaceholder,
  ModelAssessmentContext
} from "@responsible-ai/core-ui";
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
        <h1>Hi</h1>
        {
          this.context.dataset.dataBalanceMeasures?.aggregateBalanceMeasures
            ?.measures?.atkinsonIndex
        }
        <h1>Done</h1>
      </div>
    );
  }
}
