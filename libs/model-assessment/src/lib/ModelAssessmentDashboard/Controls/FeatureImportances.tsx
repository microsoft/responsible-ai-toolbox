// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  WeightVectorOption,
  defaultModelAssessmentContext,
  IModelAssessmentContext,
  ModelAssessmentContext,
  IModelExplanationData,
  IExplanationModelMetadata
} from "@responsible-ai/core-ui";
import { GlobalExplanationTab } from "@responsible-ai/interpret";
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

import { featureImportanceTabStyles } from "./FeatureImportances.styles";
import { IndividualFeatureImportanceView } from "./IndividualFeatureImportanceView";

interface IFeatureImportancesProps {
  selectedWeightVector: WeightVectorOption;
  weightVectorOptions: WeightVectorOption[];
  weightVectorLabels: Dictionary<string>;
  requestPredictions?: (
    request: any[],
    abortSignal: AbortSignal
  ) => Promise<any[]>;
  modelExplanationData?: IModelExplanationData[];
  modelMetadata: IExplanationModelMetadata;
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
    const classNames = featureImportanceTabStyles();

    return (
      <Stack className={classNames.container}>
        <Stack.Item className={classNames.header}>
          <Text variant={"xxLarge"} id="featureImportanceHeader">
            {localization.ModelAssessment.ComponentNames.FeatureImportances}
          </Text>
        </Stack.Item>
        <Stack.Item>
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
            className={classNames.tabs}
          >
            <PivotItem
              itemKey={FeatureImportancesTabOptions.GlobalExplanation}
              headerText={
                localization.ModelAssessment.FeatureImportances
                  .GlobalExplanation
              }
            />
            <PivotItem
              itemKey={FeatureImportancesTabOptions.LocalExplanation}
              headerText={
                localization.ModelAssessment.FeatureImportances.LocalExplanation
              }
            />
          </Pivot>
        </Stack.Item>

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
          <IndividualFeatureImportanceView
            features={this.context.modelMetadata.featureNames}
            jointDataset={this.context.jointDataset}
            invokeModel={this.props.requestPredictions}
            selectedWeightVector={this.props.selectedWeightVector}
            weightOptions={this.props.weightVectorOptions}
            weightLabels={this.props.weightVectorLabels}
            onWeightChange={this.props.onWeightVectorChange}
            selectedCohort={this.context.selectedErrorCohort}
            modelType={this.props.modelMetadata.modelType}
          />
        )}
      </Stack>
    );
  }
}
