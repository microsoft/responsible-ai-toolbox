// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  defaultModelAssessmentContext,
  Cohort,
  ErrorCohort,
  ICausalAnalysisData,
  ICausalAnalysisSingleData,
  ICausalPolicy,
  ITelemetryEvent,
  ModelAssessmentContext,
  ifEnableLargeData,
  LoadingSpinner
} from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";
import React from "react";

import { CausalAnalysisOptions } from "../../CausalAnalysisEnums";

import { CausalAggregateView } from "./CausalAggregateView/CausalAggregateView";
import { CausalIndividualView } from "./CausalIndividualView/CausalIndividualView";
import { LargeCausalIndividualView } from "./CausalIndividualView/LargeCausalIndividualView/LargeCausalIndividualView";
import { TreatmentView } from "./TreatmentView/TreatmentView";

export interface ICausalAnalysisViewProps {
  viewOption: string;
  newCohort: ErrorCohort;
  data: ICausalAnalysisData;
  telemetryHook?: (message: ITelemetryEvent) => void;
}

interface ICausalAnalysisState {
  currentGlobalCausalEffects?: ICausalAnalysisSingleData[];
  currentLocalCausalEffects?: ICausalAnalysisSingleData[][];
  currentGlobalCausalPolicy: undefined | ICausalPolicy[];
  isCausalPolicyDataLoading: boolean;
}

export class CausalAnalysisView extends React.PureComponent<
  ICausalAnalysisViewProps,
  ICausalAnalysisState
> {
  public static contextType = ModelAssessmentContext;
  public context: React.ContextType<typeof ModelAssessmentContext> =
    defaultModelAssessmentContext;

  public constructor(props: ICausalAnalysisViewProps) {
    super(props);
    this.state = {
      currentGlobalCausalEffects: this.sortGlobalCausalEffects(
        this.props.data.global_effects
      ),
      currentGlobalCausalPolicy: this.props.data.policies,
      currentLocalCausalEffects: this.props.data.local_effects,
      isCausalPolicyDataLoading: true
    };
  }

  public render(): React.ReactNode {
    return (
      <>
        {this.props.viewOption === CausalAnalysisOptions.Aggregate && (
          <CausalAggregateView
            globalEffects={this.state.currentGlobalCausalEffects}
            telemetryHook={this.props.telemetryHook}
          />
        )}
        {this.props.viewOption === CausalAnalysisOptions.Individual &&
          ifEnableLargeData(this.context.dataset) && (
            <LargeCausalIndividualView
              causalId={this.props.data.id}
              localEffects={this.state.currentLocalCausalEffects}
              telemetryHook={this.props.telemetryHook}
            />
          )}
        {this.props.viewOption === CausalAnalysisOptions.Individual &&
          !ifEnableLargeData(this.context.dataset) && (
            <CausalIndividualView
              localEffects={this.state.currentLocalCausalEffects}
              telemetryHook={this.props.telemetryHook}
            />
          )}
        {this.props.viewOption === CausalAnalysisOptions.Treatment &&
          this.getPolicyElement()}
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
        this.setState({ isCausalPolicyDataLoading: true });
        this.getGlobalCausalPolicy();
      }
    }
    if (this.props.newCohort.cohort.name !== prevProps.newCohort.cohort.name) {
      if (this.props.viewOption === CausalAnalysisOptions.Aggregate) {
        this.getGlobalCausalEffects();
      }
      if (this.props.viewOption === CausalAnalysisOptions.Treatment) {
        this.setState({ isCausalPolicyDataLoading: true });
        this.getGlobalCausalPolicy();
      }
    }
  }

  private getGlobalCausalEffects = async (): Promise<void> => {
    if (
      this.context.causalAnalysisData &&
      this.context.requestGlobalCausalEffects
    ) {
      const filtersRelabeled = Cohort.getLabeledFilters(
        this.props.newCohort.cohort.filters,
        this.props.newCohort.jointDataset
      );
      const compositeFiltersRelabeled = Cohort.getLabeledCompositeFilters(
        this.props.newCohort.cohort.compositeFilters,
        this.props.newCohort.jointDataset
      );
      const result = await this.context.requestGlobalCausalEffects(
        this.context.causalAnalysisData?.id,
        filtersRelabeled,
        compositeFiltersRelabeled,
        new AbortController().signal
      );
      this.setState({
        currentGlobalCausalEffects: this.sortGlobalCausalEffects(
          result.global_effects
        )
      });
    } else {
      this.setState({
        currentGlobalCausalEffects: this.sortGlobalCausalEffects(
          this.props.data.global_effects
        )
      });
    }
  };

  private getGlobalCausalPolicy = async (): Promise<void> => {
    if (
      this.context.causalAnalysisData &&
      this.context.requestGlobalCausalPolicy
    ) {
      const filtersRelabeled = Cohort.getLabeledFilters(
        this.props.newCohort.cohort.filters,
        this.props.newCohort.jointDataset
      );
      const compositeFiltersRelabeled = Cohort.getLabeledCompositeFilters(
        this.props.newCohort.cohort.compositeFilters,
        this.props.newCohort.jointDataset
      );
      const result = await this.context.requestGlobalCausalPolicy(
        this.context.causalAnalysisData?.id,
        filtersRelabeled,
        compositeFiltersRelabeled,
        new AbortController().signal
      );
      this.setState({
        currentGlobalCausalPolicy: result.policies,
        isCausalPolicyDataLoading: false
      });
    } else {
      this.setState({
        currentGlobalCausalPolicy: this.props.data.policies,
        isCausalPolicyDataLoading: false
      });
    }
  };

  private sortGlobalCausalEffects(
    globalCausalEffects?: ICausalAnalysisSingleData[]
  ): ICausalAnalysisSingleData[] | undefined {
    return globalCausalEffects?.sort((d1, d2) => d2.point - d1.point);
  }

  private getPolicyElement(): React.ReactNode {
    if (!this.state.isCausalPolicyDataLoading) {
      return (
        <TreatmentView
          data={this.state.currentGlobalCausalPolicy}
          telemetryHook={this.props.telemetryHook}
        />
      );
    }
    return <LoadingSpinner label={localization.Common.loading} />;
  }
}
