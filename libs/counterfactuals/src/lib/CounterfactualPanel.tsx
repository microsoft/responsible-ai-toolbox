// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  Panel,
  PanelType,
  Text,
  Stack,
  PrimaryButton,
  SearchBox,
  Toggle,
  TooltipHost,
  TooltipDelay,
  DirectionalHint,
  IconButton,
  ITooltipProps,
  MessageBar,
  MessageBarType
} from "@fluentui/react";
import {
  defaultModelAssessmentContext,
  ICounterfactualData,
  ITelemetryEvent,
  ModelAssessmentContext,
  TelemetryEventName,
  TelemetryLevels
} from "@responsible-ai/core-ui";
import { InfoCallout } from "@responsible-ai/error-analysis";
import { WhatIfConstants } from "@responsible-ai/interpret";
import { localization } from "@responsible-ai/localization";
import React from "react";

import { CounterfactualList } from "./CounterfactualList";
import { counterfactualPanelStyles } from "./CounterfactualPanel.styles";
import { CounterfactualPanelNameTextField } from "./CounterfactualPanelNameTextField";

export interface ICounterfactualPanelProps {
  selectedIndex: number;
  data?: ICounterfactualData;
  isPanelOpen: boolean;
  temporaryPoint: { [key: string]: string | number } | undefined;
  originalData: { [key: string]: string | number };
  telemetryHook?: (message: ITelemetryEvent) => void;
  closePanel(): void;
  saveAsPoint(): void;
  setCustomRowProperty(
    key: string | number,
    isString: boolean,
    newValue?: string
  ): void;
  setCustomRowPropertyComboBox(
    key: string | number,
    index?: number,
    value?: string
  ): void;
}
interface ICounterfactualState {
  filterText?: string;
  sortFeatures: boolean;
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
      filterText: undefined,
      sortFeatures: true
    };
  }
  public render(): React.ReactNode {
    const classes = counterfactualPanelStyles();
    return (
      <Panel
        id="CounterfactualPanel"
        isOpen={this.props.isPanelOpen}
        type={PanelType.custom}
        customWidth={"100%"}
        onDismiss={this.onClosePanel}
        closeButtonAriaLabel="Close"
        isFooterAtBottom
        className={classes.panelStyle}
        onRenderHeader={this.renderHeader}
        onRenderFooterContent={this.renderClose}
      >
        <Stack tokens={{ childrenGap: "m1" }}>
          <Stack.Item className={classes.counterfactualList}>
            <CounterfactualList
              selectedIndex={this.props.selectedIndex}
              filterText={this.state.filterText}
              originalData={this.props.originalData}
              data={this.props.data}
              temporaryPoint={this.props.temporaryPoint}
              setCustomRowProperty={this.props.setCustomRowProperty}
              setCustomRowPropertyComboBox={
                this.props.setCustomRowPropertyComboBox
              }
              sortFeatures={this.state.sortFeatures}
              telemetryHook={this.props.telemetryHook}
            />
          </Stack.Item>
        </Stack>
      </Panel>
    );
  }

  private renderHeader = (): JSX.Element => {
    const classes = counterfactualPanelStyles();
    const iconId = "counterfactualFlyoutIconId";
    const description = this.context.requestPredictions
      ? localization.Counterfactuals.panelDescription
      : localization.Counterfactuals.panelDescriptionWithoutSetValue;
    const tooltipProps: ITooltipProps = {
      onRenderContent: () => (
        <div className={classes.tooltipWrapper}>
          <div className={classes.tooltipTitle}>
            <Text variant="large" className={classes.boldText}>
              {localization.Counterfactuals.WhatIf.toggleToolTipHeader}
            </Text>
          </div>
          <div className={classes.tooltipHost}>
            <Text>{localization.Counterfactuals.WhatIf.toggleToolTipBody}</Text>
          </div>
        </div>
      )
    };
    return (
      <Stack>
        <Stack className={classes.stackHeader}>
          <Stack.Item className={classes.headerText}>
            <Text
              variant={"xLarge"}
              className={classes.boldText}
              id="counterfactualHeader"
            >
              {this.context.requestPredictions
                ? localization.Counterfactuals.whatIfPanelHeader
                : localization.Counterfactuals.panelHeader}
            </Text>
            <div className={classes.infoCallout}>
              <InfoCallout
                iconId={iconId}
                infoText={description}
                title={localization.Common.infoTitle}
              />
            </div>
          </Stack.Item>
          <Stack.Item className={classes.description}>
            <Text variant={"medium"}>{description}</Text>
          </Stack.Item>
          <Stack.Item className={classes.buttonRow}>
            <Stack
              horizontal
              tokens={{ childrenGap: "l1" }}
              className={classes.buttons}
            >
              <Stack.Item className={classes.searchBox}>
                <SearchBox
                  placeholder={
                    localization.Interpret.WhatIf.filterFeaturePlaceholder
                  }
                  onChange={this.setFilterText}
                />
              </Stack.Item>
              <Stack.Item>
                <Toggle
                  label={localization.Counterfactuals.WhatIf.sortFeatures}
                  inlineLabel
                  defaultChecked={this.state.sortFeatures}
                  onChange={this.toggleSortFeatures}
                />
              </Stack.Item>
              <Stack.Item>
                <TooltipHost
                  tooltipProps={tooltipProps}
                  delay={TooltipDelay.zero}
                  id={WhatIfConstants.whatIfPredictionTooltipIds}
                  directionalHint={DirectionalHint.rightTopEdge}
                  className={classes.tooltipHostDisplay}
                >
                  <IconButton
                    iconProps={{ iconName: "info" }}
                    ariaLabel={localization.Common.tooltipButton}
                  />
                </TooltipHost>
              </Stack.Item>
            </Stack>
          </Stack.Item>
        </Stack>
        <Stack.Item className={classes.messageBar}>
          {this.props.data?.errorMessage && (
            <MessageBar messageBarType={MessageBarType.error}>
              {this.props.data.errorMessage}
            </MessageBar>
          )}
        </Stack.Item>
      </Stack>
    );
  };

  private renderClose = (): JSX.Element => {
    const classes = counterfactualPanelStyles();
    if (!this.context.requestPredictions) {
      return <div />;
    }
    return (
      <Stack
        horizontal
        tokens={{ childrenGap: "l1" }}
        className={classes.bottom}
      >
        <Stack.Item align="end" grow={1}>
          <CounterfactualPanelNameTextField
            value={this.props.temporaryPoint?.[
              WhatIfConstants.namePath
            ]?.toString()}
            setCustomRowProperty={this.setCustomRowProperty}
          />
        </Stack.Item>
        <Stack.Item align="end" grow={5} className={classes.buttonWrapper}>
          <PrimaryButton
            className={classes.button}
            text={localization.Counterfactuals.saveAsNew}
            onClick={this.handleSavePoint}
            ariaLabel={localization.Counterfactuals.saveAsNew}
          />
        </Stack.Item>
        <Stack.Item align="end" grow={3}>
          <Text variant={"medium"} className={classes.saveDescription}>
            {localization.Counterfactuals.saveDescription}
          </Text>
        </Stack.Item>
      </Stack>
    );
  };

  private toggleSortFeatures = (
    _event: React.MouseEvent<HTMLElement, MouseEvent>,
    checked?: boolean | undefined
  ): void => {
    if (checked !== undefined) {
      this.setState({ sortFeatures: checked });
    }
  };
  private onClosePanel = (): void => {
    this.setState({
      filterText: undefined
    });
    this.props.closePanel();
  };
  private handleSavePoint = (): void => {
    this.props.saveAsPoint();
    this.onClosePanel();
    this.props.telemetryHook?.({
      level: TelemetryLevels.ButtonClick,
      type: TelemetryEventName.CounterfactualSaveAsNewDatapointClick
    });
  };
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
