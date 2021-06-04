// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  WeightVectorOption,
  defaultModelAssessmentContext,
  IModelAssessmentContext,
  ModelAssessmentContext,
  IModelExplanationData
} from "@responsible-ai/core-ui";
import { InstanceView } from "@responsible-ai/error-analysis";
import { GlobalExplanationTab, IStringsParam } from "@responsible-ai/interpret";
import _, { Dictionary } from "lodash";
import * as React from "react";

import { PredictionTabKeys } from "./../ModelAssessmentEnums";

interface IFeatureImportancesProps {
  stringParams?: IStringsParam;
  selectedWeightVector: WeightVectorOption;
  weightVectorOptions: WeightVectorOption[];
  weightVectorLabels: Dictionary<string>;
  requestPredictions?: (
    request: any[],
    abortSignal: AbortSignal
  ) => Promise<any[]>;
  predictionTab: PredictionTabKeys;
  customPoints: Array<{ [key: string]: any }>;
  setWhatIfDatapoint: (index: number) => void;
  modelExplanationData?: IModelExplanationData[];
}

interface IFeatureImportancesState {}

export class FeatureImportancesTab extends React.PureComponent<
  IFeatureImportancesProps,
  IFeatureImportancesState
> {
  public static contextType = ModelAssessmentContext;
  public context: IModelAssessmentContext = defaultModelAssessmentContext;

  public render(): React.ReactNode {
    const cohortIDs = this.context.errorCohorts.map((errorCohort) =>
      errorCohort.cohort.getCohortID().toString()
    );

    if (!this.context.modelExplanationData || this.props.modelExplanationData?.length === 0) {
      return <></>;
    }

    return (
      <>
        <GlobalExplanationTab
          cohorts={this.context.errorCohorts.map((cohort) => cohort.cohort)}
          cohortIDs={cohortIDs}
          selectedWeightVector={this.props.selectedWeightVector}
          weightOptions={this.props.weightVectorOptions}
          weightLabels={this.props.weightVectorLabels}
          onWeightChange={this.onWeightVectorChange}
          explanationMethod={
            this.props.modelExplanationData?.[0].explanationMethod
          }
        />
        <InstanceView
          messages={
            this.props.stringParams
              ? this.props.stringParams.contextualHelp
              : undefined
          }
          features={this.context.dataset.featureNames}
          invokeModel={this.props.requestPredictions}
          selectedWeightVector={this.props.selectedWeightVector}
          weightOptions={this.props.weightVectorOptions}
          weightLabels={this.props.weightVectorLabels}
          onWeightChange={this.onWeightVectorChange}
          activePredictionTab={this.props.predictionTab}
          setActivePredictionTab={(key: PredictionTabKeys): void => {
            this.setState({
              predictionTab: key
            });
          }}
          customPoints={this.props.customPoints}
          selectedCohort={this.context.selectedErrorCohort}
          setWhatIfDatapoint={this.props.setWhatIfDatapoint}
        />
      </>
    );
  }

  private onWeightVectorChange = (weightOption: WeightVectorOption): void => {
    this.context.jointDataset.buildLocalFlattenMatrix(weightOption);
    this.context.errorCohorts.forEach((errorCohort) =>
      errorCohort.cohort.clearCachedImportances()
    );
    this.setState({ selectedWeightVector: weightOption });
  };
}
