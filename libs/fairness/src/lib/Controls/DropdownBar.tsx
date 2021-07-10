// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IBounds } from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";
import _ from "lodash";
import { Stack, Dropdown, IDropdownOption } from "office-ui-fabric-react";
import React from "react";

import {
  IPerformancePickerPropsV2,
  IFairnessPickerPropsV2,
  IErrorPickerPropsV2,
  IFeatureBinPickerPropsV2
} from "../FairnessWizard";

import { IFairnessContext } from "./../util/IFairnessContext";

export interface IDropdownBarProps {
  dashboardContext: IFairnessContext;
  performancePickerProps: IPerformancePickerPropsV2;
  fairnessPickerProps: IFairnessPickerPropsV2;
  errorPickerProps: IErrorPickerPropsV2;
  featureBinPickerProps: IFeatureBinPickerPropsV2;
  parentPerformanceChanged: {
    (_ev: React.FormEvent<HTMLDivElement>, option?: IDropdownOption): void;
  };
  parentFairnessChanged: {
    (_ev: React.FormEvent<HTMLDivElement>, option?: IDropdownOption): void;
  };
  parentFeatureChanged: {
    (_ev: React.FormEvent<HTMLDivElement>, option?: IDropdownOption): void;
  };
  parentErrorChanged: {
    (_ev: React.FormEvent<HTMLDivElement>, option?: IDropdownOption): void;
  };
  fairnessBounds?: Array<IBounds | undefined>;
  performanceBounds?: Array<IBounds | undefined>;
}

export class DropdownBar extends React.PureComponent<IDropdownBarProps> {
  public render(): React.ReactNode {
    const featureOptions: IDropdownOption[] = this.props.dashboardContext.modelMetadata.featureNames.map(
      (x) => {
        return { key: x, text: x };
      }
    );
    const performanceDropDown: IDropdownOption[] = this.props.performancePickerProps.performanceOptions.map(
      (x) => {
        return { key: x.key, text: x.title };
      }
    );
    const fairnessDropdown: IDropdownOption[] = this.props.fairnessPickerProps.fairnessOptions.map(
      (x) => {
        return { key: x.key, text: x.title };
      }
    );

    return (
      <Stack horizontal tokens={{ childrenGap: "l1", padding: "0 100px" }}>
        <Dropdown
          id="sensitiveFeatureDropdown"
          label={localization.Fairness.DropdownHeaders.sensitiveFeature}
          defaultSelectedKey={
            this.props.dashboardContext.modelMetadata.featureNames[
              this.props.featureBinPickerProps.selectedBinIndex
            ]
          }
          options={featureOptions}
          disabled={false}
          onChange={this.props.parentFeatureChanged}
        />
        <Dropdown
          id="performanceMetricDropdown"
          label={localization.Fairness.DropdownHeaders.performanceMetric}
          defaultSelectedKey={
            this.props.performancePickerProps.selectedPerformanceKey
          }
          options={performanceDropDown}
          disabled={false}
          onChange={this.props.parentPerformanceChanged}
        />
        <Dropdown
          style={{ minWidth: "240px" }}
          id="fairnessMetricDropdown"
          label={localization.Fairness.DropdownHeaders.fairnessMetric}
          defaultSelectedKey={
            this.props.fairnessPickerProps.selectedFairnessKey
          }
          options={fairnessDropdown}
          disabled={false}
          onChange={this.props.parentFairnessChanged}
        />
        <Dropdown
          style={{ minWidth: "240px" }}
          id="errorMetricDropdown"
          label={localization.Fairness.DropdownHeaders.errorMetric}
          defaultSelectedKey={this.props.errorPickerProps.selectedErrorKey}
          options={[
            {
              key: "disabled",
              text: localization.Fairness.Metrics.errorMetricDisabled
            },
            {
              key: "enabled",
              text: localization.Fairness.Metrics.errorMetricEnabled
            }
          ]}
          disabled={
            (typeof this.props.fairnessBounds === "undefined" ||
              _.isEmpty(this.props.fairnessBounds.filter(Boolean))) &&
            (typeof this.props.performanceBounds === "undefined" ||
              _.isEmpty(this.props.performanceBounds.filter(Boolean)))
          }
          onChange={this.props.parentErrorChanged}
        />
      </Stack>
    );
  }
}
