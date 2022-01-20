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
  SearchBox,
  Toggle,
  TooltipHost,
  TooltipDelay,
  DirectionalHint,
  IconButton,
  ITooltipProps
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
  sortFeatures: boolean;
  closePanel(): void;
  saveAsPoint(): void;
  setCustomRowProperty(
    key: string | number,
    isString: boolean,
    newValue?: string
  ): void;
  handleSortToggle(
    _event: React.MouseEvent<HTMLElement, MouseEvent>,
    checked?: boolean | undefined
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
        id="CounterfactualPanel"
        isOpen={this.props.isPanelOpen}
        type={PanelType.largeFixed}
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
              sortFeatures={this.props.sortFeatures}
            />
          </Stack.Item>
        </Stack>
      </Panel>
    );
  }

  private renderHeader = (): JSX.Element => {
    const classes = counterfactualPanelStyles();
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
        </Stack.Item>
        <Stack.Item>
          <Text variant={"medium"}>
            {localization.Counterfactuals.panelDescription}
          </Text>
        </Stack.Item>
        <Stack.Item className={classes.buttonRow}>
          <Stack horizontal tokens={{ childrenGap: "l1" }}>
            <SearchBox
              placeholder={
                localization.Interpret.WhatIf.filterFeaturePlaceholder
              }
              onChange={this.setFilterText.bind(this)}
            />
            <Toggle
              label={localization.Counterfactuals.WhatIf.sortFeatures}
              inlineLabel
              onChange={this.props.handleSortToggle}
            />
            <TooltipHost
              tooltipProps={tooltipProps}
              delay={TooltipDelay.zero}
              id={WhatIfConstants.whatIfPredictionTooltipIds}
              directionalHint={DirectionalHint.rightTopEdge}
              className={classes.tooltipHostDisplay}
            >
              <IconButton iconProps={{ iconName: "info" }} />
            </TooltipHost>
          </Stack>
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
            className={classes.counterfactualName}
          />
        </Stack.Item>
        <Stack.Item align="end" grow={5}>
          <PrimaryButton
            className={classes.button}
            text={localization.Counterfactuals.saveAsNew}
            onClick={this.handleSavePoint}
          />
        </Stack.Item>
        <Stack.Item align="end" grow={3}>
          <Text variant={"medium"}>
            {localization.Counterfactuals.saveDescription}
          </Text>
        </Stack.Item>
      </Stack>
    );
  };

  private onClosePanel = () => {
    this.setState({
      filterText: undefined
    });
    this.props.closePanel();
  };
  private handleSavePoint = () => {
    this.props.saveAsPoint();
    this.onClosePanel();
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
