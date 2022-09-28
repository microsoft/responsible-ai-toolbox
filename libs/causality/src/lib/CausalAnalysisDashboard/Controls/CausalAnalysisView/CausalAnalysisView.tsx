// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  defaultModelAssessmentContext,
  ErrorCohort,
  ICausalAnalysisData,
  ICausalAnalysisSingleData,
  ICausalPolicy,
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

interface ICausalAnalysisState {
  currentGlobalCausalEffects: ICausalAnalysisSingleData[];
  currenLocalCausalEffects: ICausalAnalysisSingleData[][];
  currentGlobalCausalPolicy: undefined | ICausalPolicy[];
}

export class CausalAnalysisView extends React.PureComponent<ICausalAnalysisViewProps, ICausalAnalysisState> {
  public static contextType = ModelAssessmentContext;
  public context: React.ContextType<typeof ModelAssessmentContext> =
    defaultModelAssessmentContext;

  public constructor(props: ICausalAnalysisViewProps) {
    super(props);
    this.state = {currentGlobalCausalEffects: this.props.data.global_effects,
                  currenLocalCausalEffects: this.props.data.local_effects,
                  currentGlobalCausalPolicy: this.props.data.policies}
  };

  public render(): React.ReactNode {
    return (
      <>
        {this.props.viewOption === CausalAnalysisOptions.Aggregate && (
          <CausalAggregateView
            globalEffects={this.state.currentGlobalCausalEffects}
            telemetryHook={this.props.telemetryHook}
          />
        )}
        {this.props.viewOption === CausalAnalysisOptions.Individual && (
          <CausalIndividualView
            localEffects={this.state.currenLocalCausalEffects}
            telemetryHook={this.props.telemetryHook}
          />
        )}
        {this.props.viewOption === CausalAnalysisOptions.Treatment && (
          <TreatmentView
            data={this.state.currentGlobalCausalPolicy}
            telemetryHook={this.props.telemetryHook}
          />
        )}
      </>
    );
  }

  public async componentDidUpdate(
    prevProps: ICausalAnalysisViewProps
  ): Promise<void> {
    if (this.props.viewOption !== prevProps.viewOption) {
      if (this.props.viewOption === CausalAnalysisOptions.Aggregate) {
        this.getGlobalCausalEffects();
      }
      if (this.props.viewOption === CausalAnalysisOptions.Treatment) {
        this.getGlobalCausalPolicy();
      }
      this.forceUpdate();
    }
    if (this.props.newCohort.cohort.name !== prevProps.newCohort.cohort.name) {
      console.log("cohort updated");
      if (this.props.viewOption === CausalAnalysisOptions.Aggregate) {
        this.getGlobalCausalEffects();
      }
      if (this.props.viewOption === CausalAnalysisOptions.Treatment) {
        this.getGlobalCausalPolicy();
      }
      this.forceUpdate();
    }
  }

  private getGlobalCausalEffects = async(): Promise<void> =>{
    console.log(this.props);
    console.log(this.context);
    if (!this.context.causalAnalysisData) {
      this.setState({currentGlobalCausalEffects: this.props.data.global_effects});
    } else if (this.context.requestGlobalCausalEffects) {
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
      const queryData = [
        this.context.causalAnalysisData?.id,
        filtersRelabeled,
        compositeFiltersRelabeled
      ];
      console.log(queryData);
      const result = await this.context.requestGlobalCausalEffects(
        this.context.causalAnalysisData?.id,
        filtersRelabeled,
        compositeFiltersRelabeled,
        new AbortController().signal
      );
      console.log(result);
      this.setState({currentGlobalCausalEffects: result.global_effects});
    } else {
      this.setState({currentGlobalCausalEffects: this.props.data.global_effects});
    }
  }

  private getGlobalCausalPolicy = async (): Promise<void> =>{
    console.log(this.props);
    console.log(this.context);
    if (!this.context.causalAnalysisData) {
      this.setState({currentGlobalCausalPolicy: this.props.data.policies});
    } else if (this.context.requestGlobalCausalPolicy) {
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
      const queryData = [
        this.context.causalAnalysisData?.id,
        filtersRelabeled,
        compositeFiltersRelabeled
      ];
      console.log(queryData);
      const result = await this.context.requestGlobalCausalPolicy(
        this.context.causalAnalysisData?.id,
        filtersRelabeled,
        compositeFiltersRelabeled,
        new AbortController().signal
      );
      console.log(result);
      this.setState({currentGlobalCausalPolicy: result.policies});
    } else {
      this.setState({currentGlobalCausalPolicy: this.props.data.policies});
    }
  }
}
