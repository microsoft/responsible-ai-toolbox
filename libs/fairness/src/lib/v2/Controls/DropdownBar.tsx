// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { localization } from "@responsible-ai/localization";
import { Stack, Dropdown, IDropdownOption } from "office-ui-fabric-react";
import React from "react";

import { IFairnessContext } from "../../util/IFairnessContext";
import {
  IPerformancePickerPropsV2,
  IFairnessPickerPropsV2,
  IFeatureBinPickerPropsV2
} from "../FairnessWizard";

export interface IDropdownBarProps {
  dashboardContext: IFairnessContext;
  performancePickerProps: IPerformancePickerPropsV2;
  fairnessPickerProps: IFairnessPickerPropsV2;
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
          id="fairnessMetricDropdown"
          label={localization.Fairness.DropdownHeaders.fairnessMetric}
          defaultSelectedKey={
            this.props.fairnessPickerProps.selectedFairnessKey
          }
          options={fairnessDropdown}
          disabled={false}
          onChange={this.props.parentFairnessChanged}
        />
      </Stack>
    );
  }
}
