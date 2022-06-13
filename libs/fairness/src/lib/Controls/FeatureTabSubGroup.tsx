// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { ActionButton, Text } from "@fluentui/react";
import { localization } from "@responsible-ai/localization";
import React from "react";

import { IBinnedResponse } from "./../util/IBinnedResponse";

interface IFeatureTabSubGroupProps {
  item: IBinnedResponse;
}
interface IFeatureTabSubGroupState {
  expanded: boolean;
}

export class FeatureTabSubGroup extends React.Component<
  IFeatureTabSubGroupProps,
  IFeatureTabSubGroupState
> {
  public constructor(props: IFeatureTabSubGroupProps) {
    super(props);
    this.state = { expanded: false };
  }
  public render(): React.ReactNode {
    const { item } = this.props;
    const labelArray = this.state.expanded
      ? item.labelArray
      : item.labelArray.slice(0, 7);
    return (
      !!item.labelArray && (
        <div>
          {labelArray.map((category, index) => (
            <Text key={index} block>
              {category}
            </Text>
          ))}
          {item.labelArray.length > 7 && (
            <ActionButton
              iconProps={{
                iconName: this.state.expanded
                  ? "ChevronUpMed"
                  : "ChevronDownMed"
              }}
              onClick={this.toggle}
            >
              {this.state.expanded
                ? localization.Fairness.Feature.hideCategories
                : localization.Fairness.Feature.showCategories}
            </ActionButton>
          )}
        </div>
      )
    );
  }

  private readonly toggle = (): void => {
    this.setState((prev) => ({ expanded: !prev.expanded }));
  };
}
