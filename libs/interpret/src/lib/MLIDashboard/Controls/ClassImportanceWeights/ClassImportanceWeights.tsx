// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  Callout,
  DirectionalHint,
  Dropdown,
  IconButton,
  IDropdownOption,
  Text
} from "@fluentui/react";
import { WeightVectorOption, FluentUIStyles } from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";
import React from "react";

import { classImportanceWeightsStyles } from "./ClassImportanceWeights.styles";

export interface IClassImportanceWeightsProps {
  onWeightChange: (option: WeightVectorOption) => void;
  selectedWeightVector: WeightVectorOption;
  weightOptions: WeightVectorOption[];
  weightLabels: any;
}
interface IClassImportanceWeightsState {
  crossClassInfoVisible: boolean;
}

export class ClassImportanceWeights extends React.Component<
  IClassImportanceWeightsProps,
  IClassImportanceWeightsState
> {
  private weightOptions: IDropdownOption[] | undefined;
  public constructor(props: IClassImportanceWeightsProps) {
    super(props);
    this.state = {
      crossClassInfoVisible: false
    };
    this.weightOptions = this.props.weightOptions.map((option) => {
      return {
        key: option,
        text: this.props.weightLabels[option]
      };
    });
  }
  public render(): React.ReactNode {
    const classNames = classImportanceWeightsStyles();
    return (
      <div id="ClassImportanceWeights">
        <div className={classNames.multiclassWeightLabel}>
          <Text
            variant={"medium"}
            className={classNames.multiclassWeightLabelText}
          >
            {localization.Interpret.GlobalTab.weightOptions}
          </Text>
          <IconButton
            id={"cross-class-weight-info"}
            iconProps={{ iconName: "Info" }}
            title={localization.Interpret.CrossClass.info}
            onClick={this.toggleCrossClassInfo}
          />
        </div>
        {this.weightOptions && (
          <Dropdown
            options={this.weightOptions}
            selectedKey={this.props.selectedWeightVector}
            onChange={this.setWeightOption}
            ariaLabel={localization.Interpret.GlobalTab.weightOptions}
          />
        )}
        {this.state.crossClassInfoVisible && (
          <Callout
            doNotLayer
            target={"#cross-class-weight-info"}
            setInitialFocus
            onDismiss={this.toggleCrossClassInfo}
            directionalHint={DirectionalHint.leftCenter}
            role="alertdialog"
            styles={{ container: FluentUIStyles.calloutContainer }}
          >
            <div className={classNames.calloutWrapper}>
              <div className={classNames.calloutHeader}>
                <Text className={classNames.calloutTitle}>
                  {localization.Interpret.CrossClass.crossClassWeights}
                </Text>
              </div>
              <div className={classNames.calloutInner}>
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
              </div>
            </div>
          </Callout>
        )}
      </div>
    );
  }

  private toggleCrossClassInfo = (): void => {
    this.setState({ crossClassInfoVisible: !this.state.crossClassInfoVisible });
  };

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
