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
import { localization } from "@responsible-ai/localization";
import { Dictionary } from "lodash";
import {
  Pivot,
  PivotItem,
  PivotLinkSize,
  Stack,
  Text
} from "office-ui-fabric-react";
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
  setActivePredictionTab: (key: PredictionTabKeys) => void;
  onWeightVectorChange: (weightOption: WeightVectorOption) => void;
}

interface IFeatureImportancesState {
  activeFeatureImportancesOption: FeatureImportancesTabOptions;
}

enum FeatureImportancesTabOptions {
  GlobalExplanation = "global",
  LocalExplanation = "local"
}

export class FeatureImportancesTab extends React.PureComponent<
  IFeatureImportancesProps,
  IFeatureImportancesState
> {
  public static contextType = ModelAssessmentContext;
  public context: IModelAssessmentContext = defaultModelAssessmentContext;

  public constructor(props: IFeatureImportancesProps) {
    super(props);
    this.state = {
      activeFeatureImportancesOption:
        FeatureImportancesTabOptions.GlobalExplanation
    };
  }

  public render(): React.ReactNode {
    const cohortIDs = this.context.errorCohorts.map((errorCohort) =>
      errorCohort.cohort.getCohortID().toString()
    );

    if (
      !this.context.modelExplanationData ||
      this.props.modelExplanationData?.length === 0
    ) {
      return React.Fragment;
    }

    return (
      <Stack>
        <div style={{ padding: "16px 24px 16px 40px" }}>
          <Text variant={"xLarge"}>
            {localization.ModelAssessment.ComponentNames.FeatureImportances}
          </Text>
        </div>
        <Pivot
          selectedKey={this.state.activeFeatureImportancesOption}
          onLinkClick={(item: PivotItem | undefined): void => {
            if (
              item &&
              item.props.itemKey &&
              Object.values(FeatureImportancesTabOptions).includes(
                item.props.itemKey as FeatureImportancesTabOptions
              )
            ) {
              this.setState({
                activeFeatureImportancesOption: item.props
                  .itemKey as FeatureImportancesTabOptions
              });
            }
          }}
          linkSize={PivotLinkSize.normal}
          headersOnly
          styles={{
            root: {
              display: "flex",
              flexDirection: "row",
              justifyContent: "start",
              padding: "0px 30px"
            }
          }}
        >
          <PivotItem
            itemKey={FeatureImportancesTabOptions.GlobalExplanation}
            headerText={
              localization.ModelAssessment.FeatureImportances.GlobalExplanation
            }
          />
          <PivotItem
            itemKey={FeatureImportancesTabOptions.LocalExplanation}
            headerText={
              localization.ModelAssessment.FeatureImportances.LocalExplanation
            }
          />
        </Pivot>
        {this.state.activeFeatureImportancesOption ===
          FeatureImportancesTabOptions.GlobalExplanation && (
          <GlobalExplanationTab
            cohorts={this.context.errorCohorts.map((cohort) => cohort.cohort)}
            cohortIDs={cohortIDs}
            selectedWeightVector={this.props.selectedWeightVector}
            weightOptions={this.props.weightVectorOptions}
            weightLabels={this.props.weightVectorLabels}
            onWeightChange={this.props.onWeightVectorChange}
            explanationMethod={
              this.props.modelExplanationData?.[0].explanationMethod
            }
          />
        )}
        {this.state.activeFeatureImportancesOption ===
          FeatureImportancesTabOptions.LocalExplanation && (
          <InstanceView
            messages={
              this.props.stringParams
                ? this.props.stringParams.contextualHelp
                : undefined
            }
            features={this.context.dataset.feature_names}
            invokeModel={this.props.requestPredictions}
            selectedWeightVector={this.props.selectedWeightVector}
            weightOptions={this.props.weightVectorOptions}
            weightLabels={this.props.weightVectorLabels}
            onWeightChange={this.props.onWeightVectorChange}
            activePredictionTab={this.props.predictionTab}
            setActivePredictionTab={this.props.setActivePredictionTab}
            customPoints={this.props.customPoints}
            selectedCohort={this.context.selectedErrorCohort}
            setWhatIfDatapoint={this.props.setWhatIfDatapoint}
          />
        )}
      </Stack>
    );
  }
}
