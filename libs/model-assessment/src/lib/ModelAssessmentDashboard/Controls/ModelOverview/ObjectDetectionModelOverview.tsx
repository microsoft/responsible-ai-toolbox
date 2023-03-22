// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  ComboBox,
  IComboBoxOption,
  IProcessedStyleSet,
  Slider,
  Stack
} from "@fluentui/react";
import { FluentUIStyles, IDataset } from "@responsible-ai/core-ui";
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
}

export class ObjectDetectionWidgets extends React.PureComponent<IObjectDetectionWidgetsProps> {
  public render(): React.ReactNode {
    return (
      <Stack.Item>
        <ComboBox
          id="modelOverviewAggregateMethod"
          label={localization.ModelAssessment.ModelOverview.metricsTypeDropdown}
          selectedKey={"macro"}
          options={getSelectableAggregateMethod()}
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
          className={this.props.classNames.dropdown}
          styles={FluentUIStyles.smallDropdownStyle}
        />
        <Slider
          id="iouThreshold"
          label={
            localization.ModelAssessment.ModelOverview.iouthresholdDropdown
          }
          max={100}
          className={this.props.classNames.slider}
          valueFormat={(value: number): string => `IoU=${value}%`}
          showValue
        />
      </Stack.Item>
    );
  }
}
