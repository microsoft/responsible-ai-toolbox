// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { localization } from "@responsible-ai/localization";
import {
  ComboBox,
  Dropdown,
  FocusZone,
  IComboBox,
  IComboBoxOption,
  IconButton,
  IDropdownOption,
  Label,
  PrimaryButton,
  SearchBox,
  Stack,
  Text,
  TextField
} from "office-ui-fabric-react";
import React from "react";

import { IExplanationModelMetadata, JointDataset } from "@responsible-ai/core-ui";

import { CustomPredictionLabels } from "./CustomPredictionLabels";
import { ExistingPredictionLabels } from "./ExistingPredictionLabels";
import { WhatIfConstants } from "./WhatIfConstants";
import { whatIfTabStyles } from "./WhatIfTab.styles";

export interface IWhatIfPanelProps {
  editingDataCustomIndex?: number;
  validationErrors: { [key: string]: string | undefined };
  stringifedValues: { [key: string]: string };
  metadata: IExplanationModelMetadata;
  temporaryPoint: { [key: string]: any } | undefined;
  jointDataset: JointDataset;
  selectedWhatIfRootIndex: number;
  rowOptions: IDropdownOption[] | undefined;
  isPanelOpen: boolean;
  isInPanel: boolean;
  filteredFeatureList: IDropdownOption[];
  openPanel(): void;
  dismissPanel(): void;
  invokeModel?(data: any[], abortSignal: AbortSignal): Promise<any[]>;
  setSelectedIndex(_event: React.FormEvent, item?: IDropdownOption): void;
  setCustomRowProperty(
    key: string | number,
    isString: boolean,
    newValue?: string
  ): void;
  filterFeatures(
    _event?: React.ChangeEvent<HTMLInputElement>,
    newValue?: string
  ): void;
  setCustomRowPropertyDropdown(
    key: string | number,
    option?: IComboBoxOption,
    value?: string
  ): void;
  savePoint(): void;
  saveAsPoint(): void;
}

export class WhatIfPanel extends React.Component<IWhatIfPanelProps> {
  public render(): React.ReactNode {
    const classNames = whatIfTabStyles();
    const inputDisabled = !this.props.invokeModel;
    let panelStyle: string;
    if (this.props.isInPanel) {
      panelStyle = classNames.expandedInPanel;
    } else if (this.props.isPanelOpen) {
      panelStyle = classNames.expandedPanel;
    } else {
      panelStyle = classNames.collapsedPanel;
    }
    return (
      <Stack className={panelStyle} horizontal>
        {!this.props.isInPanel &&
          (this.props.isPanelOpen ? (
            <IconButton
              id={"what-if-collapse-btn"}
              iconProps={{ iconName: "ChevronRight" }}
              onClick={this.props.dismissPanel}
            />
          ) : (
            <IconButton
              id={"what-if-expand-btn"}
              iconProps={{ iconName: "ChevronLeft" }}
              onClick={this.props.openPanel}
            />
          ))}
        <Stack tokens={{ childrenGap: "l1" }}>
          {this.props.isPanelOpen && (
            <>
              <Stack.Item>
                <Label>
                  {this.props.invokeModel
                    ? localization.Interpret.WhatIfTab.whatIfDatapoint
                    : localization.Interpret.WhatIfTab.dataPointInfo}
                </Label>
                {this.props.invokeModel ? (
                  <Text variant={"small"}>
                    {localization.Interpret.WhatIfTab.whatIfHelpText}
                  </Text>
                ) : (
                  <FocusZone className={classNames.notAvailable}>
                    <Text variant={"small"}>
                      {localization.Interpret.WhatIfTab.notAvailable}
                    </Text>
                  </FocusZone>
                )}
              </Stack.Item>
              <Stack.Item>
                {this.props.rowOptions && (
                  <Dropdown
                    id="indexSelector"
                    label={localization.Interpret.WhatIfTab.indexLabel}
                    options={this.props.rowOptions}
                    selectedKey={this.props.selectedWhatIfRootIndex}
                    onChange={this.props.setSelectedIndex}
                    disabled={inputDisabled}
                  />
                )}
                <ExistingPredictionLabels
                  jointDataset={this.props.jointDataset}
                  metadata={this.props.metadata}
                  selectedWhatIfRootIndex={this.props.selectedWhatIfRootIndex}
                />
                {this.props.invokeModel && (
                  <>
                    <TextField
                      id="whatIfNameLabel"
                      label={localization.Interpret.WhatIfTab.whatIfNameLabel}
                      value={
                        this.props.temporaryPoint?.[WhatIfConstants.namePath]
                      }
                      onChange={this.setCustomRowProperty.bind(
                        this,
                        WhatIfConstants.namePath,
                        true
                      )}
                      styles={{ fieldGroup: { width: 200 } }}
                      disabled={inputDisabled}
                    />
                    <CustomPredictionLabels
                      jointDataset={this.props.jointDataset}
                      metadata={this.props.metadata}
                      selectedWhatIfRootIndex={
                        this.props.selectedWhatIfRootIndex
                      }
                      temporaryPoint={this.props.temporaryPoint}
                    />
                  </>
                )}
              </Stack.Item>
              <Stack.Item className={classNames.featureList}>
                <Label>{localization.Interpret.WhatIfTab.featureValues}</Label>
                <SearchBox
                  placeholder={
                    localization.Interpret.WhatIf.filterFeaturePlaceholder
                  }
                  onChange={this.props.filterFeatures}
                />
                {this.props.filteredFeatureList.map((item) => {
                  const metaInfo = this.props.jointDataset.metaDict[item.key];
                  if (item.data && item.data.categoricalOptions) {
                    return (
                      <ComboBox
                        key={item.key}
                        label={metaInfo.abbridgedLabel}
                        autoComplete={"on"}
                        allowFreeform={true}
                        selectedKey={this.props.temporaryPoint?.[item.key]}
                        options={item.data.categoricalOptions}
                        onChange={this.setCustomRowPropertyDropdown.bind(
                          this,
                          item.key
                        )}
                        disabled={inputDisabled}
                      />
                    );
                  }
                  return (
                    <TextField
                      key={item.key}
                      label={metaInfo.abbridgedLabel}
                      value={this.props.stringifedValues[item.key]}
                      onChange={this.setCustomRowProperty.bind(
                        this,
                        item.key,
                        false
                      )}
                      errorMessage={this.props.validationErrors[item.key]}
                      disabled={inputDisabled}
                    />
                  );
                })}
              </Stack.Item>
              {!inputDisabled && (
                <>
                  {this.props.editingDataCustomIndex !== undefined && (
                    <PrimaryButton
                      disabled={
                        this.props.temporaryPoint?.[
                          JointDataset.PredictedYLabel
                        ] === undefined
                      }
                      text={localization.Interpret.WhatIfTab.saveChanges}
                      onClick={this.props.savePoint}
                    />
                  )}
                  <PrimaryButton
                    disabled={
                      this.props.temporaryPoint?.[
                        JointDataset.PredictedYLabel
                      ] === undefined
                    }
                    text={localization.Interpret.WhatIfTab.saveAsNewPoint}
                    onClick={this.props.saveAsPoint}
                  />
                </>
              )}
              <Text variant={"xSmall"}>
                {localization.Interpret.WhatIfTab.disclaimer}
              </Text>
            </>
          )}
        </Stack>
      </Stack>
    );
  }
  private setCustomRowProperty = (
    key: string | number,
    isString: boolean,
    _event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>,
    newValue?: string
  ): void => {
    this.props.setCustomRowProperty(key, isString, newValue);
  };
  private setCustomRowPropertyDropdown = (
    key: string | number,
    _event: React.FormEvent<IComboBox>,
    option?: IComboBoxOption,
    _index?: number,
    value?: string
  ): void => {
    this.props.setCustomRowPropertyDropdown(key, option, value);
  };
}
