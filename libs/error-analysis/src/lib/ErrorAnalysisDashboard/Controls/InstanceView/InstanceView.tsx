// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  IStackItemStyles,
  PrimaryButton,
  ChoiceGroup,
  Stack,
  Text,
  IChoiceGroupOptionProps,
  IChoiceGroupOption
} from "@fluentui/react";
import {
  WeightVectorOption,
  ErrorCohort,
  defaultModelAssessmentContext,
  ModelAssessmentContext
} from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";
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
  selectedAllIndexes: number[];
  selectedAllCorrectIndexes: number[];
  selectedAllIncorrectIndexes: number[];
  selectedIncorrectDatasetIndexes: number[];
  selectedCorrectDatasetIndexes: number[];
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
  public context: React.ContextType<typeof ModelAssessmentContext> =
    defaultModelAssessmentContext;

  private choiceItems: IChoiceGroupOption[] = [];
  public constructor(props: IInstanceViewProps) {
    super(props);
    this.state = {
      selectionDetails: {
        selectedAllCorrectIndexes: [],
        selectedAllIncorrectIndexes: [],
        selectedAllIndexes: [],
        selectedCorrectDatasetIndexes: [],
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
            features={this.context.modelMetadata.featureNames}
            jointDataset={this.context.jointDataset}
            metadata={this.context.modelMetadata}
            selectedCohort={this.props.selectedCohort}
            messages={this.props.messages}
            inspectedIndexes={this.state.selectionDetails.selectedAllIndexes}
            selectedWeightVector={this.props.selectedWeightVector}
            weightOptions={this.props.weightOptions}
            weightLabels={this.props.weightLabels}
            invokeModel={this.props.invokeModel}
            onWeightChange={this.props.onWeightChange}
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
                onChange={this.handlePredictionTabClick}
                styles={{
                  flexContainer: classNames.choiceGroupContainerStyle
                }}
                options={this.choiceItems}
              />
            </Stack.Item>
            <Stack.Item align="end" styles={inspectButtonStyles}>
              <PrimaryButton
                text={localization.ErrorAnalysis.InstanceView.inspect}
                onClick={this.inspect}
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
              features={this.context.modelMetadata.featureNames}
              jointDataset={this.context.jointDataset}
              messages={this.props.messages}
              dataView={DataViewKeys.CorrectInstances}
              selectedIndexes={
                this.state.selectionDetails.selectedCorrectDatasetIndexes
              }
              setSelectedIndexes={this.setCorrectSelectedIndexes}
              selectedCohort={this.props.selectedCohort}
              setWhatIfDatapoint={this.props.setWhatIfDatapoint}
            />
          </div>
        )}
        {this.props.activePredictionTab ===
          PredictionTabKeys.IncorrectPredictionTab && (
          <div className="tabularDataView">
            <TabularDataView
              features={this.context.modelMetadata.featureNames}
              jointDataset={this.context.jointDataset}
              messages={this.props.messages}
              dataView={DataViewKeys.IncorrectInstances}
              selectedIndexes={
                this.state.selectionDetails.selectedIncorrectDatasetIndexes
              }
              setSelectedIndexes={this.setIncorrectSelectedIndexes}
              selectedCohort={this.props.selectedCohort}
              setWhatIfDatapoint={this.props.setWhatIfDatapoint}
            />
          </div>
        )}
        {this.props.activePredictionTab ===
          PredictionTabKeys.AllSelectedTab && (
          <div className="tabularDataView">
            <TabularDataView
              features={this.context.modelMetadata.featureNames}
              jointDataset={this.context.jointDataset}
              messages={this.props.messages}
              dataView={DataViewKeys.SelectedInstances}
              setSelectedIndexes={this.updateAllSelectedIndexes}
              selectedIndexes={this.state.selectionDetails.selectedAllIndexes}
              allSelectedIndexes={
                this.state.selectionDetails.selectedAllIndexes
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
              features={this.context.modelMetadata.featureNames}
              jointDataset={this.context.jointDataset}
              messages={this.props.messages}
              customPoints={this.props.customPoints}
              dataView={DataViewKeys.SelectedInstances}
              setSelectedIndexes={(): void => {
                // do nothing.
              }}
              selectedIndexes={[]}
              allSelectedIndexes={[]}
              selectedCohort={this.props.selectedCohort}
              setWhatIfDatapoint={(): void => {
                // do nothing.
              }}
            />
          </div>
        )}
      </div>
    );
  }

  private handlePredictionTabClick = (
    _?: React.FormEvent<HTMLElement | HTMLInputElement>,
    option?: IChoiceGroupOption
  ): void => {
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
        const selectedAllIndexes = [...selectionDetails.selectedAllIndexes];
        // If going from AllSelectedTab, need to update the other arrays
        if (props.activePredictionTab === PredictionTabKeys.AllSelectedTab) {
          selectedCorrectIndexes = selectedCorrectIndexes.filter((index) =>
            selectedAllIndexes.includes(index)
          );
          selectedIncorrectIndexes = selectedIncorrectIndexes.filter((index) =>
            selectedAllIndexes.includes(index)
          );
        }
        this.props.setActivePredictionTab(PredictionTabKeys[option.key]);
        return {
          selectionDetails: {
            selectedAllCorrectIndexes: selectedCorrectIndexes,
            selectedAllIncorrectIndexes: selectedIncorrectIndexes,
            selectedAllIndexes,
            selectedCorrectDatasetIndexes: selectedCorrectIndexes,
            selectedIncorrectDatasetIndexes: selectedIncorrectIndexes
          }
        };
      };
      this.setState(predictionTabClickFunc);
    }
  };

  private inspect = (): void => {
    this.props.setActivePredictionTab(PredictionTabKeys.InspectionTab);
  };

  private setCorrectSelectedIndexes = (indexes: number[]): void => {
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
          selectedAllCorrectIndexes: selectedCorrectIndexes,
          selectedAllIncorrectIndexes: selectedIncorrectIndexes,
          selectedAllIndexes: selectedIndexes,
          selectedCorrectDatasetIndexes: selectedCorrectIndexes,
          selectedIncorrectDatasetIndexes: selectedIncorrectIndexes
        }
      };
    };
    this.setState(reloadDataFunc);
  };

  private setIncorrectSelectedIndexes = (indexes: number[]): void => {
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
          selectedAllCorrectIndexes: selectedCorrectIndexes,
          selectedAllIncorrectIndexes: selectedIncorrectIndexes,
          selectedAllIndexes: selectedIndexes,
          selectedCorrectDatasetIndexes: selectedCorrectIndexes,
          selectedIncorrectDatasetIndexes: selectedIncorrectIndexes
        }
      };
    };
    this.setState(reloadDataFunc);
  };

  private updateAllSelectedIndexes = (indexes: number[]): void => {
    const reloadDataFunc = (
      state: Readonly<IInstanceViewState>
    ): IInstanceViewState => {
      const selectionDetails = state.selectionDetails;
      const correctDatasetIndexes =
        selectionDetails.selectedCorrectDatasetIndexes.filter((value) =>
          indexes.includes(value)
        );
      const incorrectDatasetIndexes =
        selectionDetails.selectedIncorrectDatasetIndexes.filter((value) =>
          indexes.includes(value)
        );
      return {
        selectionDetails: {
          selectedAllCorrectIndexes: correctDatasetIndexes,
          selectedAllIncorrectIndexes: incorrectDatasetIndexes,
          selectedAllIndexes: indexes,
          selectedCorrectDatasetIndexes:
            selectionDetails.selectedCorrectDatasetIndexes,
          selectedIncorrectDatasetIndexes:
            selectionDetails.selectedIncorrectDatasetIndexes
        }
      };
    };
    this.setState(reloadDataFunc);
  };

  private onRenderLabel =
    (type: SelectionType) =>
    (p: IChoiceGroupOptionProps | undefined): JSX.Element => {
      const classNames = InstanceViewStyles();
      let selectionText = "";
      switch (type) {
        case SelectionType.AllSelectionType: {
          selectionText = localization.formatString(
            localization.ErrorAnalysis.InstanceView.selection,
            this.state.selectionDetails.selectedAllIndexes.length
          );
          break;
        }
        case SelectionType.CorrectSelectionType: {
          let countCorrect: number;
          if (
            this.props.activePredictionTab === PredictionTabKeys.AllSelectedTab
          ) {
            countCorrect =
              this.state.selectionDetails.selectedAllCorrectIndexes.length;
          } else {
            countCorrect =
              this.state.selectionDetails.selectedCorrectDatasetIndexes.length;
          }
          selectionText = localization.formatString(
            localization.ErrorAnalysis.InstanceView.selection,
            countCorrect
          );
          break;
        }
        case SelectionType.IncorrectSelectionType: {
          let countIncorrect: number;
          if (
            this.props.activePredictionTab === PredictionTabKeys.AllSelectedTab
          ) {
            countIncorrect =
              this.state.selectionDetails.selectedAllIncorrectIndexes.length;
          } else {
            countIncorrect =
              this.state.selectionDetails.selectedIncorrectDatasetIndexes
                .length;
          }
          selectionText = localization.formatString(
            localization.ErrorAnalysis.InstanceView.selection,
            countIncorrect
          );
          break;
        }
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
            <span id={p?.labelId} className="ms-ChoiceFieldLabel">
              {p?.text}
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
