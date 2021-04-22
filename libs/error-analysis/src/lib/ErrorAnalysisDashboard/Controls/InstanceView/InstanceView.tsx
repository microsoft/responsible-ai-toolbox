// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  WeightVectorOption,
  ErrorCohort,
  defaultModelAssessmentContext,
  ModelAssessmentContext
} from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";
import {
  IChoiceGroupOption,
  IStackItemStyles,
  PrimaryButton,
  ChoiceGroup,
  Stack,
  Text
} from "office-ui-fabric-react";
import React from "react";

import { PredictionTabKeys } from "../../ErrorAnalysisEnums";
import { HelpMessageDict } from "../../Interfaces/IStringsParam";
import { InspectionView } from "../InspectionView/InspectionView";
import {
  DataViewKeys,
  TabularDataView
} from "../TabularDataView/TabularDataView";

import { InstanceViewStyles } from "./InstanceView.styles";

export interface ISelectionDetails {
  selectedDatasetIndexes: number[];
  selectedCorrectDatasetIndexes: number[];
  selectedIncorrectDatasetIndexes: number[];
  selectedAllSelectedIndexes: number[];
}

export interface IInstanceViewProps {
  messages?: HelpMessageDict;
  features: string[];
  invokeModel?: (data: any[], abortSignal: AbortSignal) => Promise<any[]>;
  selectedWeightVector: WeightVectorOption;
  weightOptions: WeightVectorOption[];
  weightLabels: any;
  onWeightChange: (option: WeightVectorOption) => void;
  activePredictionTab: PredictionTabKeys;
  setActivePredictionTab: (key: PredictionTabKeys) => void;
  customPoints: Array<{ [key: string]: any }>;
  selectedCohort: ErrorCohort;
  setWhatIfDatapoint: (index: number) => void;
}

export interface IInstanceViewState {
  selectionDetails: ISelectionDetails;
}

const inspectButtonStyles: IStackItemStyles = {
  root: {
    paddingRight: 20
  }
};

enum SelectionType {
  CorrectSelectionType = "CorrectSelectionType",
  IncorrectSelectionType = "IncorrectSelectionType",
  AllSelectionType = "AllSelectionType"
}

export class InstanceView extends React.Component<
  IInstanceViewProps,
  IInstanceViewState
> {
  public static contextType = ModelAssessmentContext;
  public context: React.ContextType<
    typeof ModelAssessmentContext
  > = defaultModelAssessmentContext;

  private choiceItems: IChoiceGroupOption[] = [];
  public constructor(props: IInstanceViewProps) {
    super(props);
    this.state = {
      selectionDetails: {
        selectedAllSelectedIndexes: [],
        selectedCorrectDatasetIndexes: [],
        selectedDatasetIndexes: [],
        selectedIncorrectDatasetIndexes: []
      }
    };

    const classNames = InstanceViewStyles();
    this.choiceItems.push({
      key: PredictionTabKeys.CorrectPredictionTab,
      onRenderLabel: this.onRenderLabel(SelectionType.CorrectSelectionType),
      styles: {
        root: classNames.choiceItemRootStyle
      },
      text: localization.ErrorAnalysis.correctPrediction
    });
    this.choiceItems.push({
      key: PredictionTabKeys.IncorrectPredictionTab,
      onRenderLabel: this.onRenderLabel(SelectionType.IncorrectSelectionType),
      styles: {
        root: classNames.choiceItemRootStyle
      },
      text: localization.ErrorAnalysis.incorrectPrediction
    });
    this.choiceItems.push({
      key: PredictionTabKeys.AllSelectedTab,
      onRenderLabel: this.onRenderLabel(SelectionType.AllSelectionType),
      styles: {
        root: classNames.choiceItemRootStyle
      },
      text: localization.ErrorAnalysis.allSelected
    });
    this.choiceItems.push({
      key: PredictionTabKeys.WhatIfDatapointsTab,
      styles: {
        root: classNames.choiceItemRootStyle
      },
      text: localization.ErrorAnalysis.whatIfDatapoints
    });
  }

  public render(): React.ReactNode {
    const classNames = InstanceViewStyles();
    if (this.props.activePredictionTab === PredictionTabKeys.InspectionTab) {
      return (
        <div className={classNames.frame}>
          <InspectionView
            theme={this.context.theme}
            messages={this.props.messages}
            features={this.props.features}
            jointDataset={this.context.jointDataset}
            inspectedIndexes={
              this.state.selectionDetails.selectedAllSelectedIndexes
            }
            metadata={this.context.modelMetadata}
            selectedWeightVector={this.props.selectedWeightVector}
            weightOptions={this.props.weightOptions}
            weightLabels={this.props.weightLabels}
            invokeModel={this.props.invokeModel}
            onWeightChange={this.props.onWeightChange}
            selectedCohort={this.props.selectedCohort}
          />
        </div>
      );
    }
    return (
      <div className={classNames.frame}>
        <Stack>
          <Stack horizontal horizontalAlign="space-between">
            <Stack.Item align="start">
              <ChoiceGroup
                selectedKey={this.props.activePredictionTab}
                onChange={this.handlePredictionTabClick.bind(this)}
                styles={{
                  flexContainer: classNames.choiceGroupContainerStyle
                }}
                options={this.choiceItems}
              />
            </Stack.Item>
            <Stack.Item align="end" styles={inspectButtonStyles}>
              <PrimaryButton
                text={localization.ErrorAnalysis.InstanceView.inspect}
                onClick={this.inspect.bind(this)}
                allowDisabledFocus
                disabled={false}
                checked={false}
              />
            </Stack.Item>
          </Stack>
        </Stack>
        {this.props.activePredictionTab ===
          PredictionTabKeys.CorrectPredictionTab && (
          <div className="tabularDataView">
            <TabularDataView
              theme={this.context.theme}
              messages={this.props.messages}
              features={this.props.features}
              jointDataset={this.context.jointDataset}
              dataView={DataViewKeys.CorrectInstances}
              selectedIndexes={
                this.state.selectionDetails.selectedCorrectDatasetIndexes
              }
              setSelectedIndexes={this.setCorrectSelectedIndexes.bind(this)}
              selectedCohort={this.props.selectedCohort}
              setWhatIfDatapoint={this.props.setWhatIfDatapoint}
            />
          </div>
        )}
        {this.props.activePredictionTab ===
          PredictionTabKeys.IncorrectPredictionTab && (
          <div className="tabularDataView">
            <TabularDataView
              theme={this.context.theme}
              messages={this.props.messages}
              features={this.props.features}
              jointDataset={this.context.jointDataset}
              dataView={DataViewKeys.IncorrectInstances}
              selectedIndexes={
                this.state.selectionDetails.selectedIncorrectDatasetIndexes
              }
              setSelectedIndexes={this.setIncorrectSelectedIndexes.bind(this)}
              selectedCohort={this.props.selectedCohort}
              setWhatIfDatapoint={this.props.setWhatIfDatapoint}
            />
          </div>
        )}
        {this.props.activePredictionTab ===
          PredictionTabKeys.AllSelectedTab && (
          <div className="tabularDataView">
            <TabularDataView
              theme={this.context.theme}
              messages={this.props.messages}
              features={this.props.features}
              jointDataset={this.context.jointDataset}
              dataView={DataViewKeys.SelectedInstances}
              setSelectedIndexes={this.updateAllSelectedIndexes.bind(this)}
              selectedIndexes={
                this.state.selectionDetails.selectedAllSelectedIndexes
              }
              allSelectedIndexes={
                this.state.selectionDetails.selectedAllSelectedIndexes
              }
              selectedCohort={this.props.selectedCohort}
              setWhatIfDatapoint={this.props.setWhatIfDatapoint}
            />
          </div>
        )}
        {this.props.activePredictionTab ===
          PredictionTabKeys.WhatIfDatapointsTab && (
          <div className="tabularDataView">
            <TabularDataView
              theme={this.context.theme}
              messages={this.props.messages}
              features={this.props.features}
              jointDataset={this.context.jointDataset}
              customPoints={this.props.customPoints}
              dataView={DataViewKeys.SelectedInstances}
              setSelectedIndexes={this.updateAllSelectedIndexes.bind(this)}
              selectedIndexes={
                this.state.selectionDetails.selectedAllSelectedIndexes
              }
              allSelectedIndexes={
                this.state.selectionDetails.selectedAllSelectedIndexes
              }
              selectedCohort={this.props.selectedCohort}
              setWhatIfDatapoint={(_: number) => {
                // do nothing.
              }}
            />
          </div>
        )}
      </div>
    );
  }

  private handlePredictionTabClick(
    _?: React.FormEvent<HTMLElement | HTMLInputElement>,
    option?: IChoiceGroupOption
  ): void {
    if (option) {
      const predictionTabClickFunc = (
        state: Readonly<IInstanceViewState>,
        props: Readonly<IInstanceViewProps>
      ): IInstanceViewState => {
        const selectionDetails = state.selectionDetails;
        let selectedCorrectIndexes =
          selectionDetails.selectedCorrectDatasetIndexes;
        let selectedIncorrectIndexes =
          selectionDetails.selectedIncorrectDatasetIndexes;
        const selectedAllSelectedIndexes =
          selectionDetails.selectedAllSelectedIndexes;
        // If going from AllSelectedTab, need to update the other arrays
        if (props.activePredictionTab === PredictionTabKeys.AllSelectedTab) {
          selectedCorrectIndexes = selectedCorrectIndexes.filter((index) =>
            selectedAllSelectedIndexes.includes(index)
          );
          selectedIncorrectIndexes = selectedIncorrectIndexes.filter((index) =>
            selectedAllSelectedIndexes.includes(index)
          );
        }
        const selectedIndexes = [
          ...selectedCorrectIndexes,
          ...selectedIncorrectIndexes
        ];
        this.props.setActivePredictionTab(PredictionTabKeys[option.key]);
        return {
          selectionDetails: {
            selectedAllSelectedIndexes,
            selectedCorrectDatasetIndexes: selectedCorrectIndexes,
            selectedDatasetIndexes: selectedIndexes,
            selectedIncorrectDatasetIndexes: selectedIncorrectIndexes
          }
        };
      };
      this.setState(predictionTabClickFunc);
    }
  }

  private inspect(): void {
    this.props.setActivePredictionTab(PredictionTabKeys.InspectionTab);
  }

  private setCorrectSelectedIndexes(indexes: number[]): void {
    const reloadDataFunc = (
      state: Readonly<IInstanceViewState>
    ): IInstanceViewState => {
      const selectionDetails = state.selectionDetails;
      const selectedCorrectIndexes = indexes;
      const selectedIncorrectIndexes =
        selectionDetails.selectedIncorrectDatasetIndexes;
      const selectedIndexes = [
        ...selectedCorrectIndexes,
        ...selectedIncorrectIndexes
      ];
      return {
        selectionDetails: {
          selectedAllSelectedIndexes: selectedIndexes,
          selectedCorrectDatasetIndexes: selectedCorrectIndexes,
          selectedDatasetIndexes: selectedIndexes,
          selectedIncorrectDatasetIndexes: selectedIncorrectIndexes
        }
      };
    };
    this.setState(reloadDataFunc);
  }

  private setIncorrectSelectedIndexes(indexes: number[]): void {
    const reloadDataFunc = (
      state: Readonly<IInstanceViewState>
    ): IInstanceViewState => {
      const selectionDetails = state.selectionDetails;
      const selectedCorrectIndexes =
        selectionDetails.selectedCorrectDatasetIndexes;
      const selectedIncorrectIndexes = indexes;
      const selectedIndexes = [
        ...selectedCorrectIndexes,
        ...selectedIncorrectIndexes
      ];
      return {
        selectionDetails: {
          selectedAllSelectedIndexes: selectedIndexes,
          selectedCorrectDatasetIndexes: selectedCorrectIndexes,
          selectedDatasetIndexes: selectedIndexes,
          selectedIncorrectDatasetIndexes: selectedIncorrectIndexes
        }
      };
    };
    this.setState(reloadDataFunc);
  }

  private updateAllSelectedIndexes(indexes: number[]): void {
    const reloadDataFunc = (
      state: Readonly<IInstanceViewState>
    ): IInstanceViewState => {
      const selectionDetails = state.selectionDetails;
      return {
        selectionDetails: {
          selectedAllSelectedIndexes: indexes,
          selectedCorrectDatasetIndexes:
            selectionDetails.selectedCorrectDatasetIndexes,
          selectedDatasetIndexes: selectionDetails.selectedDatasetIndexes,
          selectedIncorrectDatasetIndexes:
            selectionDetails.selectedIncorrectDatasetIndexes
        }
      };
    };
    this.setState(reloadDataFunc);
  }

  private onRenderLabel = (type: SelectionType) => (
    p: IChoiceGroupOption | undefined
  ) => {
    const classNames = InstanceViewStyles();
    let selectionText = "";
    switch (type) {
      case SelectionType.AllSelectionType:
        selectionText = localization.formatString(
          localization.ErrorAnalysis.InstanceView.selection,
          this.state.selectionDetails.selectedAllSelectedIndexes.length
        );
        break;
      case SelectionType.CorrectSelectionType:
        selectionText = localization.formatString(
          localization.ErrorAnalysis.InstanceView.selection,
          this.state.selectionDetails.selectedCorrectDatasetIndexes.length
        );
        break;
      case SelectionType.IncorrectSelectionType:
        selectionText = localization.formatString(
          localization.ErrorAnalysis.InstanceView.selection,
          this.state.selectionDetails.selectedIncorrectDatasetIndexes.length
        );
        break;
      default:
        break;
    }
    const stackItemStyles: IStackItemStyles = {
      root: classNames.stackItemsStyle
    };
    const textStyle = {
      root: classNames.selectedTextStyle
    };
    return (
      <Stack>
        <Stack.Item align="start">
          <span id={p!.labelId} className="ms-ChoiceFieldLabel">
            {p!.text}
          </span>
        </Stack.Item>
        <Stack.Item align="start" styles={stackItemStyles}>
          <Text variant="small" styles={textStyle}>
            {selectionText}
          </Text>
        </Stack.Item>
      </Stack>
    );
  };
}
