// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  ComboBox,
  IComboBox,
  IComboBoxOption,
  IProcessedStyleSet,
  Slider,
  Stack
} from "@fluentui/react";
import {
  FluentUIStyles,
  IDataset,
  ITelemetryEvent,
  TelemetryEventName,
  TelemetryLevels
} from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";
import React from "react";

import { IModelOverviewStyles } from "./ModelOverview.styles";

export function getSelectableAggregateMethod(): IComboBoxOption[] {
  const selectableAggregateMethods: IComboBoxOption[] = [
    {
      key: "macro",
      text: localization.ModelAssessment.ModelOverview.metricTypes.macro
    },
    {
      key: "micro",
      text: localization.ModelAssessment.ModelOverview.metricTypes.micro
    }
  ];
  return selectableAggregateMethods;
}

export function getSelectableClassNames(dataset: IDataset): IComboBoxOption[] {
  const selectableClassNames: IComboBoxOption[] = [];
  if (dataset.class_names) {
    for (const className of dataset.class_names) {
      selectableClassNames.push({
        key: className,
        text: className
      });
    }
  }
  return selectableClassNames;
}

export interface IObjectDetectionWidgetsProps {
  // single args on MO state & functions that updates the state,
  classNames: IProcessedStyleSet<IModelOverviewStyles>;
  dataset: IDataset;
  modelOverview: any, // avoided ModelOverview due to circular imports
  telemetryHook?: (message: ITelemetryEvent) => void;
}

export class ObjectDetectionWidgets extends React.PureComponent<IObjectDetectionWidgetsProps> {
  public constructor(props: IObjectDetectionWidgetsProps) {
    super(props);
  }

  private logButtonClick = (eventName: TelemetryEventName): void => {
    // Copied from ModelOverview.tsx. TODO: Maybe emulate from there?
    this.props.telemetryHook?.({
      level: TelemetryLevels.ButtonClick,
      type: eventName
    });
  };

  private onAggregateMethodChange = (
    _: React.FormEvent<IComboBox>,
    item?: IComboBoxOption
  ): void => {
    if (item && item.selected !== undefined) {
      this.props.modelOverview.setState({ aggregateMethod: item.key.toString() })
      this.logButtonClick(
        TelemetryEventName.ModelOverviewMetricsSelectionUpdated
      );
    }
  }

  private onClassNameChange = (
    _: React.FormEvent<IComboBox>,
    item?: IComboBoxOption
  ): void => {
    if (item && item.selected !== undefined) {
      this.props.modelOverview.setState({ className: item.key.toString() })
      this.logButtonClick(
        TelemetryEventName.ModelOverviewMetricsSelectionUpdated
      );
    }
  }

  private onIoUThresholdChange = (
    _: React.FormEvent<IComboBox>,
    value: number
  ): void => {
    if (value) {
      this.props.modelOverview.setState({ iouThresh: value })
      this.logButtonClick(
        TelemetryEventName.ModelOverviewMetricsSelectionUpdated
      );
    }
  }

  public render(): React.ReactNode {
    return (
      <Stack.Item>
        <ComboBox
          id="modelOverviewAggregateMethod"
          label={localization.ModelAssessment.ModelOverview.metricsTypeDropdown}
          selectedKey={"macro"}
          options={getSelectableAggregateMethod()}
          onChange={this.onAggregateMethodChange}
          className={this.props.classNames.dropdown}
          styles={FluentUIStyles.smallDropdownStyle}
        />
        <ComboBox
          id="modelOverviewClassSelection"
          placeholder={
            localization.ModelAssessment.ModelOverview
              .classSelectionDropdownPlaceholder
          }
          label={
            localization.ModelAssessment.ModelOverview.classSelectionDropdown
          }
          options={getSelectableClassNames(this.props.dataset)}
          onChange={this.onClassNameChange}
          className={this.props.classNames.dropdown}
          styles={FluentUIStyles.smallDropdownStyle}
        />
        <Slider
          id="iouThreshold"
          label={
            localization.ModelAssessment.ModelOverview.iouthresholdDropdown
          }
          max={100}
          defaultValue={70}
          className={this.props.classNames.slider}
          onChanged={this.onIoUThresholdChange}
          valueFormat={(value: number): string => `IoU=${value}%`}
          showValue
        />
      </Stack.Item>
    );
  }
}
