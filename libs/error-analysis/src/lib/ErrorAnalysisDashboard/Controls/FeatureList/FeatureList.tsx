// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  PrimaryButton,
  IFocusTrapZoneProps,
  ISearchBoxStyles,
  IStackTokens
} from "office-ui-fabric-react";
import { Checkbox } from "office-ui-fabric-react/lib/Checkbox";
import { Panel } from "office-ui-fabric-react/lib/Panel";
import { SearchBox } from "office-ui-fabric-react/lib/SearchBox";
import { Stack } from "office-ui-fabric-react/lib/Stack";
import { Text } from "office-ui-fabric-react/lib/Text";
import React from "react";

import { featureListStyles } from "./FeatureList.styles";

export interface IFeatureListProps {
  isOpen: boolean;
  onDismiss: () => void;
  saveFeatures: (features: string[]) => void;
  features: string[];
  theme?: string;
}

const focusTrapZoneProps: IFocusTrapZoneProps = {
  forceFocusInsideTrap: false,
  isClickableOutsideFocusTrap: true
};

const searchBoxStyles: Partial<ISearchBoxStyles> = { root: { width: 120 } };

// Used to add spacing between example checkboxes
const checkboxStackTokens: IStackTokens = {
  childrenGap: "s1",
  padding: "m"
};

export interface IFeatureListState {
  features: string[];
}

export class FeatureList extends React.Component<
  IFeatureListProps,
  IFeatureListState
> {
  public constructor(props: IFeatureListProps) {
    super(props);
    this.state = {
      features: this.props.features
    };
  }

  public render(): React.ReactNode {
    const classNames = featureListStyles();
    return (
      <Panel
        headerText="Feature List"
        isOpen={this.props.isOpen}
        focusTrapZoneProps={focusTrapZoneProps}
        // You MUST provide this prop! Otherwise screen readers will just say "button" with no label.
        closeButtonAriaLabel="Close"
        // layerProps={{ hostId: this.props.hostId }}
        isBlocking={false}
        onDismiss={this.props.onDismiss}
      >
        <div className="featuresSelector">
          <Stack tokens={checkboxStackTokens} verticalAlign="space-around">
            <Stack.Item key="decisionTreeKey" align="start">
              <Text
                key="decisionTreeTextKey"
                className={classNames.decisionTree}
              >
                Decision Tree
              </Text>
            </Stack.Item>
            <Stack.Item key="searchKey" align="start">
              <SearchBox
                placeholder="Search"
                styles={searchBoxStyles}
                onSearch={this.onSearch.bind(this)}
                onClear={this.onSearch.bind(this)}
                onChange={(_, newValue?: string): void =>
                  this.onSearch.bind(this)(newValue!)
                }
              />
            </Stack.Item>
            {this.props.features.map((feature) => (
              <Stack.Item key={"checkboxKey" + feature} align="start">
                <Checkbox
                  label={feature}
                  checked={this.state.features.includes(feature)}
                  onChange={this.onChange.bind(this, feature)}
                />
              </Stack.Item>
            ))}
            <Stack.Item key="applyButtonKey" align="start">
              <PrimaryButton
                text="Apply"
                onClick={this.apply.bind(this)}
                allowDisabledFocus
                disabled={false}
                checked={false}
              />
            </Stack.Item>
          </Stack>
        </div>
      </Panel>
    );
  }

  private onChange(
    feature?: string,
    _?: React.FormEvent<HTMLElement>,
    isChecked?: boolean
  ): void {
    if (isChecked) {
      if (!this.state.features.includes(feature!)) {
        this.setState({
          features: [...this.state.features.concat([feature!])]
        });
      }
    } else {
      this.setState({
        features: [
          ...this.state.features.filter(
            (stateFeature) => stateFeature !== feature!
          )
        ]
      });
    }
  }

  private onSearch(searchValue: string): void {
    this.setState({
      features: this.props.features.filter((feature) =>
        feature.includes(searchValue)
      )
    });
  }

  private apply(): void {
    this.props.saveFeatures(this.state.features);
  }
}
