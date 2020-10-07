// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  ComboBox,
  Dropdown,
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

import { localization } from "../../../Localization/localization";
import { IExplanationModelMetadata } from "../../IExplanationContext";
import { JointDataset } from "../../JointDataset";

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
    return (
      <Stack
        className={
          this.props.isPanelOpen
            ? classNames.expandedPanel
            : classNames.collapsedPanel
        }
        horizontal
      >
        {this.props.isPanelOpen ? (
          <IconButton
            iconProps={{ iconName: "ChevronRight" }}
            onClick={this.props.dismissPanel}
          />
        ) : (
          <IconButton
            iconProps={{ iconName: "ChevronLeft" }}
            onClick={this.props.openPanel}
          />
        )}
        <Stack tokens={{ childrenGap: "l1" }}>
          {this.props.isPanelOpen && (
            <>
              <Stack.Item>
                <Label>{localization.WhatIfTab.whatIfDatapoint}</Label>
                <Text variant={"small"}>
                  {localization.WhatIfTab.whatIfHelpText}
                </Text>
              </Stack.Item>
              <Stack.Item>
                {this.props.rowOptions && (
                  <Dropdown
                    label={localization.WhatIfTab.indexLabel}
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
                <TextField
                  label={localization.WhatIfTab.whatIfNameLabel}
                  value={this.props.temporaryPoint?.[WhatIfConstants.namePath]}
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
                  selectedWhatIfRootIndex={this.props.selectedWhatIfRootIndex}
                  temporaryPoint={this.props.temporaryPoint}
                />
              </Stack.Item>
              <Stack.Item className={classNames.featureList}>
                <Label>{localization.WhatIfTab.featureValues}</Label>
                <SearchBox
                  placeholder={localization.WhatIf.filterFeaturePlaceholder}
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
                      text={localization.WhatIfTab.saveChanges}
                      onClick={this.props.savePoint}
                    />
                  )}
                  <PrimaryButton
                    disabled={
                      this.props.temporaryPoint?.[
                        JointDataset.PredictedYLabel
                      ] === undefined
                    }
                    text={localization.WhatIfTab.saveAsNewPoint}
                    onClick={this.props.saveAsPoint}
                  />
                  <Text variant={"xSmall"}>
                    {localization.WhatIfTab.disclaimer}
                  </Text>
                </>
              )}
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
