// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  defaultModelAssessmentContext,
  ErrorCohort,
  ICausalAnalysisData,
  ITelemetryEvent,
  ModelAssessmentContext
} from "@responsible-ai/core-ui";
import React from "react";

import { CausalAnalysisOptions } from "../../CausalAnalysisEnums";

import { CausalAggregateView } from "./CausalAggregateView/CausalAggregateView";
import { CausalIndividualView } from "./CausalIndividualView/CausalIndividualView";
import { TreatmentView } from "./TreatmentView/TreatmentView";

export interface ICausalAnalysisViewProps {
  viewOption: string;
  newCohort: ErrorCohort;
  data: ICausalAnalysisData;
  telemetryHook?: (message: ITelemetryEvent) => void;
}

export class CausalAnalysisView extends React.PureComponent<ICausalAnalysisViewProps> {
  public static contextType = ModelAssessmentContext;
  public context: React.ContextType<typeof ModelAssessmentContext> =
    defaultModelAssessmentContext;
  // private currentGlobalCausalEffects = undefined | ICausalAnalysisData;
  // private currentGlobalCausalPolicy = undefined | ICausalAnalysisData;

  public render(): React.ReactNode {
    return (
      <>
        {this.props.viewOption === CausalAnalysisOptions.Aggregate && (
          <CausalAggregateView
            globalEffects={this.props.data.global_effects}
            telemetryHook={this.props.telemetryHook}
          />
        )}
        {this.props.viewOption === CausalAnalysisOptions.Individual && (
          <CausalIndividualView
            localEffects={this.props.data.local_effects}
            telemetryHook={this.props.telemetryHook}
          />
        )}
        {this.props.viewOption === CausalAnalysisOptions.Treatment && (
          <TreatmentView
            data={this.props.data.policies}
            telemetryHook={this.props.telemetryHook}
          />
        )}
      </>
    );
  }

  public async componentDidUpdate(prevProps: ICausalAnalysisViewProps): Promise<void> {
    console.log(prevProps);
    console.log(this.props);
    console.log(this.context);
    if (this.context.causalAnalysisData && this.context.requestGlobalCausalEffects) {
      console.log("Fetching global causal effects from SDK backend");
      const filtersRelabeled = ErrorCohort.getLabeledFilters(
        this.props.newCohort.cohort.filters,
        this.props.newCohort.jointDataset
      );
    
      const compositeFiltersRelabeled = ErrorCohort.getLabeledCompositeFilters(
        this.props.newCohort.cohort.compositeFilters,
        this.props.newCohort.jointDataset
      );
      console.log(filtersRelabeled);
      console.log(compositeFiltersRelabeled);
      const query_data = [
        this.context.causalAnalysisData?.id,
        filtersRelabeled,
        compositeFiltersRelabeled
      ];
      console.log(query_data);
      const result = await this.context.requestGlobalCausalEffects(
        this.context.causalAnalysisData?.id,
        filtersRelabeled,
        compositeFiltersRelabeled,
        new AbortController().signal
      );
      console.log(result);
      // this.currentGlobalCausalEffects = result;
    }
    if (this.context.causalAnalysisData && this.context.requestGlobalCausalPolicy) {
      console.log("Fetching global causal policy from SDK backend");
      const filtersRelabeled = ErrorCohort.getLabeledFilters(
        this.props.newCohort.cohort.filters,
        this.props.newCohort.jointDataset
      );
    
      const compositeFiltersRelabeled = ErrorCohort.getLabeledCompositeFilters(
        this.props.newCohort.cohort.compositeFilters,
        this.props.newCohort.jointDataset
      );
      console.log(filtersRelabeled);
      console.log(compositeFiltersRelabeled);
      const query_data = [
        this.context.causalAnalysisData?.id,
        filtersRelabeled,
        compositeFiltersRelabeled
      ];
      console.log(query_data);
      const result = await this.context.requestGlobalCausalPolicy(
        this.context.causalAnalysisData?.id,
        filtersRelabeled,
        compositeFiltersRelabeled,
        new AbortController().signal
      );
      console.log(result);
      // this.currentGlobalCausalPolicy = result;
    }
    if (this.props.viewOption !== prevProps.viewOption) {
      this.forceUpdate();
    }
    if (this.props.newCohort.cohort.name !== prevProps.newCohort.cohort.name) {
      console.log("cohort updated");
      this.forceUpdate();
    }
  }
}
