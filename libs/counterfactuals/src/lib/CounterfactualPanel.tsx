// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  defaultModelAssessmentContext,
  ICounterfactualData,
  ModelAssessmentContext
} from "@responsible-ai/core-ui";
import { WhatIfConstants } from "@responsible-ai/interpret";
import { localization } from "@responsible-ai/localization";
import {
  Panel,
  PanelType,
  Text,
  Stack,
  PrimaryButton,
  TextField,
  SearchBox
} from "office-ui-fabric-react";
import React from "react";

import { CounterfactualList } from "./CounterfactualList";
import { counterfactualPanelStyles } from "./CounterfactualPanelStyles";

export interface ICounterfactualPanelProps {
  selectedIndex: number;
  data?: ICounterfactualData;
  isPanelOpen: boolean;
  temporaryPoint: { [key: string]: string | number } | undefined;
  originalData: { [key: string]: string | number };
  closePanel(): void;
  saveAsPoint(): void;
  setCustomRowProperty(
    key: string | number,
    isString: boolean,
    newValue?: string
  ): void;
}
interface ICounterfactualState {
  filterText?: string;
}

export class CounterfactualPanel extends React.Component<
  ICounterfactualPanelProps,
  ICounterfactualState
> {
  public static contextType = ModelAssessmentContext;
  public context: React.ContextType<typeof ModelAssessmentContext> =
    defaultModelAssessmentContext;
  public constructor(props: ICounterfactualPanelProps) {
    super(props);
    this.state = {
      filterText: undefined
    };
  }
  public render(): React.ReactNode {
    const classes = counterfactualPanelStyles();
    return (
      <Panel
        isOpen={this.props.isPanelOpen}
        type={PanelType.largeFixed}
        onDismiss={this.onClosePanel.bind(this)}
        closeButtonAriaLabel="Close"
        headerText={localization.Counterfactuals.panelHeader}
      >
        <Stack tokens={{ childrenGap: "m1" }}>
          <Stack.Item>
            <Text variant={"medium"}>
              {localization.Counterfactuals.panelDescription}
            </Text>
          </Stack.Item>
          <Stack.Item className={classes.searchBox}>
            <SearchBox
              placeholder={
                localization.Interpret.WhatIf.filterFeaturePlaceholder
              }
              onChange={this.setFilterText.bind(this)}
            />
          </Stack.Item>
          <Stack.Item className={classes.counterfactualList}>
            <CounterfactualList
              selectedIndex={this.props.selectedIndex}
              filterText={this.state.filterText}
              originalData={this.props.originalData}
              data={this.props.data}
              temporaryPoint={this.props.temporaryPoint}
              setCustomRowProperty={this.props.setCustomRowProperty}
            />
          </Stack.Item>
          <Stack.Item>
            <Stack horizontal tokens={{ childrenGap: "15px" }}>
              <Stack.Item align="end" grow={1}>
                <TextField
                  id="whatIfNameLabel"
                  label={localization.Counterfactuals.counterfactualName}
                  value={this.props.temporaryPoint?.[
                    WhatIfConstants.namePath
                  ]?.toString()}
                  onChange={this.setCustomRowProperty.bind(
                    this,
                    WhatIfConstants.namePath,
                    true
                  )}
                  styles={{ fieldGroup: { width: 200 } }}
                />
              </Stack.Item>
              <Stack.Item align="end" grow={5}>
                <PrimaryButton
                  className={classes.button}
                  text={localization.Counterfactuals.saveAsNew}
                  onClick={this.handleSavePoint.bind(this)}
                />
              </Stack.Item>
              <Stack.Item align="end" grow={3}>
                <Text variant={"medium"}>
                  {localization.Counterfactuals.saveDescription}
                </Text>
              </Stack.Item>
            </Stack>
          </Stack.Item>
        </Stack>
      </Panel>
    );
  }
  private onClosePanel(): void {
    this.setState({
      filterText: undefined
    });
    this.props.closePanel();
  }
  private handleSavePoint(): void {
    this.props.saveAsPoint();
    this.onClosePanel();
  }
  private setCustomRowProperty = (
    key: string | number,
    isString: boolean,
    _event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>,
    newValue?: string
  ): void => {
    this.props.setCustomRowProperty(key, isString, newValue);
  };
  private setFilterText = (
    _event?: React.ChangeEvent<HTMLInputElement> | undefined,
    newValue?: string | undefined
  ): void => {
    this.setState({
      filterText: newValue
    });
  };
}
