// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  JointDataset,
  IExplanationModelMetadata,
  WeightVectorOption
} from "@responsible-ai/interpret";
import { localization } from "@responsible-ai/localization";
import {
  IChoiceGroupOption,
  IStackItemStyles,
  ITheme,
  PrimaryButton,
  ChoiceGroup,
  Stack
} from "office-ui-fabric-react";
import React from "react";

import { PredictionTabKeys } from "../../ErrorAnalysisDashboard";
import { ErrorCohort } from "../../ErrorCohort";
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
  theme?: ITheme;
  messages?: HelpMessageDict;
  features: string[];
  jointDataset: JointDataset;
  metadata: IExplanationModelMetadata;
  invokeModel?: (data: any[], abortSignal: AbortSignal) => Promise<any[]>;
  selectedWeightVector: WeightVectorOption;
  weightOptions: WeightVectorOption[];
  weightLabels: any;
  onWeightChange: (option: WeightVectorOption) => void;
  activePredictionTab: PredictionTabKeys;
  setActivePredictionTab: (key: PredictionTabKeys) => void;
  customPoints: Array<{ [key: string]: any }>;
  selectedCohort: ErrorCohort;
}

export interface IInstanceViewState {
  selectionDetails: ISelectionDetails;
}

const inspectButtonStyles: IStackItemStyles = {
  root: {
    paddingRight: 20
  }
};

export class InstanceView extends React.Component<
  IInstanceViewProps,
  IInstanceViewState
> {
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
      styles: {
        root: classNames.choiceItemRootStyle
      },
      text: localization.ErrorAnalysis.correctPrediction
    });
    this.choiceItems.push({
      key: PredictionTabKeys.IncorrectPredictionTab,
      styles: {
        root: classNames.choiceItemRootStyle
      },
      text: localization.ErrorAnalysis.incorrectPrediction
    });
    this.choiceItems.push({
      key: PredictionTabKeys.WhatIfDatapointsTab,
      styles: {
        root: classNames.choiceItemRootStyle
      },
      text: localization.ErrorAnalysis.whatIfDatapoints
    });
    this.choiceItems.push({
      key: PredictionTabKeys.AllSelectedTab,
      styles: {
        root: classNames.choiceItemRootStyle
      },
      text: localization.ErrorAnalysis.allSelected
    });
  }

  public render(): React.ReactNode {
    const classNames = InstanceViewStyles();
    if (this.props.activePredictionTab === PredictionTabKeys.InspectionTab) {
      return (
        <div>
          <InspectionView
            theme={this.props.theme}
            messages={this.props.messages}
            features={this.props.features}
            jointDataset={this.props.jointDataset}
            inspectedIndexes={
              this.state.selectionDetails.selectedAllSelectedIndexes
            }
            metadata={this.props.metadata}
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
      <div>
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
                text="Inspect"
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
              theme={this.props.theme}
              messages={this.props.messages}
              features={this.props.features}
              jointDataset={this.props.jointDataset}
              dataView={DataViewKeys.CorrectInstances}
              selectedIndexes={
                this.state.selectionDetails.selectedCorrectDatasetIndexes
              }
              setSelectedIndexes={this.setCorrectSelectedIndexes.bind(this)}
              selectedCohort={this.props.selectedCohort}
            />
          </div>
        )}
        {this.props.activePredictionTab ===
          PredictionTabKeys.IncorrectPredictionTab && (
          <div className="tabularDataView">
            <TabularDataView
              theme={this.props.theme}
              messages={this.props.messages}
              features={this.props.features}
              jointDataset={this.props.jointDataset}
              dataView={DataViewKeys.IncorrectInstances}
              selectedIndexes={
                this.state.selectionDetails.selectedIncorrectDatasetIndexes
              }
              setSelectedIndexes={this.setIncorrectSelectedIndexes.bind(this)}
              selectedCohort={this.props.selectedCohort}
            />
          </div>
        )}
        {this.props.activePredictionTab ===
          PredictionTabKeys.AllSelectedTab && (
          <div className="tabularDataView">
            <TabularDataView
              theme={this.props.theme}
              messages={this.props.messages}
              features={this.props.features}
              jointDataset={this.props.jointDataset}
              dataView={DataViewKeys.SelectedInstances}
              setSelectedIndexes={this.updateAllSelectedIndexes.bind(this)}
              selectedIndexes={
                this.state.selectionDetails.selectedAllSelectedIndexes
              }
              allSelectedIndexes={
                this.state.selectionDetails.selectedAllSelectedIndexes
              }
              selectedCohort={this.props.selectedCohort}
            />
          </div>
        )}
        {this.props.activePredictionTab ===
          PredictionTabKeys.WhatIfDatapointsTab && (
          <div className="tabularDataView">
            <TabularDataView
              theme={this.props.theme}
              messages={this.props.messages}
              features={this.props.features}
              jointDataset={this.props.jointDataset}
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
}
