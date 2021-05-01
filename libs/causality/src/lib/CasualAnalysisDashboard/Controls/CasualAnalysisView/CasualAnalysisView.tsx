// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  defaultModelAssessmentContext,
  ICasualAnalysisData,
  ModelAssessmentContext
} from "@responsible-ai/core-ui";
import React from "react";

import { CasualAnalysisOptions } from "../../CasualAnalysisEnums";

import { CasualAggregateChart } from "./CasualAggregateChart";

export interface ICasualAnalysisViewProps {
  viewOption: string;
  data: ICasualAnalysisData;
}

export class CasualAnalysisView extends React.PureComponent<ICasualAnalysisViewProps> {
  public static contextType = ModelAssessmentContext;
  public context: React.ContextType<
    typeof ModelAssessmentContext
  > = defaultModelAssessmentContext;

  public render(): React.ReactNode {
    return (
      <>
        {this.props.viewOption === CasualAnalysisOptions.Aggregate && (
          <CasualAggregateChart data={this.props.data}/>
        )}
        {this.props.viewOption === CasualAnalysisOptions.Individual && (
          <CasualAggregateChart data={this.props.data}/>
        )}
      </>
    );
  }

  public componentDidUpdate(prevProps: ICasualAnalysisViewProps): void {
    if (
      this.props.viewOption !== prevProps.viewOption
    ) {
      this.forceUpdate();
    }
  }
}
