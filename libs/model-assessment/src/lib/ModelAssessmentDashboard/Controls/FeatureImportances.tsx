// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IObjectWithKey, Pivot, PivotItem, Stack } from "@fluentui/react";
import {
  WeightVectorOption,
  defaultModelAssessmentContext,
  IModelAssessmentContext,
  ModelAssessmentContext,
  IModelExplanationData,
  IExplanationModelMetadata,
  ITelemetryEvent,
  TelemetryLevels,
  TelemetryEventName,
  ifEnableLargeData
} from "@responsible-ai/core-ui";
import { GlobalExplanationTab } from "@responsible-ai/interpret";
import { localization } from "@responsible-ai/localization";
import { Dictionary } from "lodash";
import * as React from "react";

import { featureImportanceTabStyles } from "./FeatureImportances.styles";
import { IndividualFeatureImportanceView } from "./IndividualFeatureImportanceView/IndividualFeatureImportanceView";
import { LargeIndividualFeatureImportanceView } from "./IndividualFeatureImportanceView/LargeIndividualFeatureImportanceView/LargeIndividualFeatureImportanceView";

interface IFeatureImportancesProps {
  allSelectedItems: IObjectWithKey[];
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
  telemetryHook?: (message: ITelemetryEvent) => void;
  onPivotChange?: (option: FeatureImportancesTabOptions) => void;
}

interface IFeatureImportancesState {
  activeFeatureImportancesOption: FeatureImportancesTabOptions;
}

export enum FeatureImportancesTabOptions {
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
        <Pivot
          selectedKey={this.state.activeFeatureImportancesOption}
          onLinkClick={this.onPivotLinkClick}
          linkSize={"normal"}
          headersOnly
          className={classNames.tabs}
          overflowBehavior="menu"
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
            telemetryHook={this.props.telemetryHook}
          />
        )}
        {this.state.activeFeatureImportancesOption ===
          FeatureImportancesTabOptions.LocalExplanation &&
          !ifEnableLargeData(this.context.dataset) && (
            <IndividualFeatureImportanceView
              allSelectedItems={this.props.allSelectedItems}
              features={this.context.modelMetadata.featureNames}
              jointDataset={this.context.jointDataset}
              invokeModel={this.props.requestPredictions}
              selectedWeightVector={this.props.selectedWeightVector}
              weightOptions={this.props.weightVectorOptions}
              weightLabels={this.props.weightVectorLabels}
              onWeightChange={this.props.onWeightVectorChange}
              selectedCohort={this.context.selectedErrorCohort}
              modelType={this.props.modelMetadata.modelType}
              telemetryHook={this.props.telemetryHook}
            />
          )}
        {this.state.activeFeatureImportancesOption ===
          FeatureImportancesTabOptions.LocalExplanation &&
          ifEnableLargeData(this.context.dataset) && (
            <LargeIndividualFeatureImportanceView
              cohort={this.context.selectedErrorCohort.cohort}
              modelType={this.props.modelMetadata.modelType}
              telemetryHook={this.props.telemetryHook}
              selectedWeightVector={this.props.selectedWeightVector}
              onWeightChange={this.props.onWeightVectorChange}
              weightOptions={this.props.weightVectorOptions}
              weightLabels={this.props.weightVectorLabels}
            />
          )}
      </Stack>
    );
  }

  private onPivotLinkClick = (item: PivotItem | undefined): void => {
    if (
      item &&
      item.props.itemKey &&
      Object.values(FeatureImportancesTabOptions).includes(
        item.props.itemKey as FeatureImportancesTabOptions
      )
    ) {
      const option = item.props.itemKey as FeatureImportancesTabOptions;
      this.setState({
        activeFeatureImportancesOption: option
      });
      this.props.onPivotChange?.(option);
      this.props.telemetryHook?.({
        level: TelemetryLevels.ButtonClick,
        type:
          item.props.itemKey === FeatureImportancesTabOptions.GlobalExplanation
            ? TelemetryEventName.AggregateFeatureImportanceTabClick
            : TelemetryEventName.IndividualFeatureImportanceTabClick
      });
    }
  };
}
