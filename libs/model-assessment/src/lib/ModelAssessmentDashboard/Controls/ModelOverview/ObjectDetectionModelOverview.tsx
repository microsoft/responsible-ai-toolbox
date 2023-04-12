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
  ITelemetryEvent} from "@responsible-ai/core-ui";
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
  classNames: IProcessedStyleSet<IModelOverviewStyles>;
  dataset: IDataset;
  setAggregateMethod: (value: string) => void;
  setClassName: (value: string) => void;
  setIoUThreshold: (value: number) => void;
  updateDatasetCohortStats: () => void;
  updateFeatureCohortStats: () => void;
  telemetryHook?: (message: ITelemetryEvent) => void;
}

export class ObjectDetectionWidgets extends React.PureComponent<IObjectDetectionWidgetsProps> {
  public render(): React.ReactNode {
    return (
      <Stack.Item>
        <ComboBox
          id="modelOverviewAggregateMethod"
          label={localization.ModelAssessment.ModelOverview.metricsTypeDropdown}
          defaultSelectedKey={"macro"}
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

  private onAggregateMethodChange = (
    _: React.FormEvent<IComboBox>,
    item?: IComboBoxOption
  ): void => {
    console.log(item);
    if (item) {
      console.log("entered aggregate method change");
      this.props.setAggregateMethod(item.text.toString());
    }
  };

  private onClassNameChange = (
    _: React.FormEvent<IComboBox>,
    item?: IComboBoxOption
  ): void => {
    console.log(item);
    if (item) {
      console.log("entered class name change");
      this.props.setClassName(item.text.toString())
    }
  };

  private onIoUThresholdChange = (_: React.MouseEvent, value: number): void => {
    if (value) {
      console.log("entered iou threshold change");
      this.props.setIoUThreshold(value);
    }
  };
}
