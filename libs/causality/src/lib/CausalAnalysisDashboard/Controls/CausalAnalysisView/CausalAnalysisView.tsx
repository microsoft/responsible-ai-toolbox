// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  defaultModelAssessmentContext,
  ICausalAnalysisData,
  ModelAssessmentContext
} from "@responsible-ai/core-ui";
import React from "react";

import { CausalAnalysisOptions } from "../../CausalAnalysisEnums";

import { CausalAggregateView } from "./CausalAggregateView/CausalAggregateView";
import { CausalIndividualView } from "./CausalIndividualView/CausalIndividualView";
import { TreatmentView } from "./TreatmentView/TreatmentView";

export interface ICausalAnalysisViewProps {
  viewOption: string;
  data: ICausalAnalysisData;
}

export class CausalAnalysisView extends React.PureComponent<ICausalAnalysisViewProps> {
  public static contextType = ModelAssessmentContext;
  public context: React.ContextType<typeof ModelAssessmentContext> =
    defaultModelAssessmentContext;

  public render(): React.ReactNode {
    return (
      <>
        {this.props.viewOption === CausalAnalysisOptions.Aggregate && (
          <CausalAggregateView data={this.props.data} />
        )}
        {this.props.viewOption === CausalAnalysisOptions.Individual && (
          <CausalIndividualView data={this.props.data} />
        )}
        {this.props.viewOption === CausalAnalysisOptions.Treatment && (
          <TreatmentView data={this.props.data.policies} />
        )}
      </>
    );
  }

  public componentDidUpdate(prevProps: ICausalAnalysisViewProps): void {
    if (this.props.viewOption !== prevProps.viewOption) {
      this.forceUpdate();
    }
  }
}
