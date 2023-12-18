// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  DirectionalHint,
  Dropdown,
  IDropdownOption,
  Text
} from "@fluentui/react";
import {
  WeightVectorOption,
  LabelWithCallout,
  ITelemetryEvent,
  TelemetryEventName
} from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";
import { Dictionary } from "lodash";
import React from "react";

export interface IClassImportanceWeightsProps {
  onWeightChange: (option: WeightVectorOption) => void;
  selectedWeightVector: WeightVectorOption;
  weightOptions: WeightVectorOption[];
  weightLabels: Dictionary<string>;
  disabled?: boolean;
  telemetryHook?: (message: ITelemetryEvent) => void;
}

export class ClassImportanceWeights extends React.Component<IClassImportanceWeightsProps> {
  private weightOptions: IDropdownOption[] | undefined;
  public constructor(props: IClassImportanceWeightsProps) {
    super(props);
    this.weightOptions = this.props.weightOptions.map((option) => {
      return {
        key: option,
        text: this.props.weightLabels[option]
      };
    });
  }
  public render(): React.ReactNode {
    const iconButtonId = "cross-class-weight-info";
    const calloutTarget = `#${iconButtonId}`;
    return (
      <div id="ClassImportanceWeights">
        {this.weightOptions && (
          <div>
            <LabelWithCallout
              calloutTitle={localization.Interpret.CrossClass.crossClassWeights}
              label={localization.Interpret.GlobalTab.weightOptions}
              telemetryHook={this.props.telemetryHook}
              calloutEventName={
                TelemetryEventName.FeatureImportancesCrossClassWeightsCalloutClick
              }
              iconButtonId={iconButtonId}
              calloutTarget={calloutTarget}
              renderOnNewLayer
              directionalHint={DirectionalHint.leftCenter}
            >
              <Text>{localization.Interpret.CrossClass.overviewInfo}</Text>
              <ul>
                <li>
                  <Text>
                    {localization.Interpret.CrossClass.absoluteValInfo}
                  </Text>
                </li>
                <li>
                  <Text>
                    {localization.Interpret.CrossClass.enumeratedClassInfo}
                  </Text>
                </li>
              </ul>
            </LabelWithCallout>
            <Dropdown
              id={"classWeightDropdown"}
              options={this.weightOptions}
              selectedKey={this.props.selectedWeightVector}
              onChange={this.setWeightOption}
              ariaLabel={localization.Interpret.GlobalTab.weightOptionsDropdown}
              disabled={this.props.disabled ?? false}
            />
          </div>
        )}
      </div>
    );
  }

  private setWeightOption = (
    _event: React.FormEvent<HTMLDivElement>,
    item?: IDropdownOption
  ): void => {
    if (item?.key === undefined) {
      return;
    }
    const newIndex = item.key as WeightVectorOption;
    this.props.onWeightChange(newIndex);
  };
}
