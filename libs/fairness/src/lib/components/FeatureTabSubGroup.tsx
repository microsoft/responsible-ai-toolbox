// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { ActionButton, Text } from "office-ui-fabric-react";
import React from "react";

import { localization } from "@responsible-ai/localization";
import { IBinnedResponse } from "../util/IBinnedResponse";

import { FeatureTabStyles } from "./FeatureTab.styles";

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
    const styles = FeatureTabStyles();
    const { item } = this.props;
    const labelArray = this.state.expanded
      ? item.labelArray
      : item.labelArray.slice(0, 7);
    return (
      !!item.labelArray && (
        <div>
          {labelArray.map((category, index) => (
            <Text key={index} className={styles.category} block>
              {category}
            </Text>
          ))}
          {item.labelArray.length > 7 && (
            <ActionButton
              className={styles.expandButton}
              iconProps={{
                iconName: this.state.expanded
                  ? "ChevronUpMed"
                  : "ChevronDownMed"
              }}
              onClick={this.toggle}
            >
              {this.state.expanded
                ? localization.Feature.hideCategories
                : localization.Feature.showCategories}
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
