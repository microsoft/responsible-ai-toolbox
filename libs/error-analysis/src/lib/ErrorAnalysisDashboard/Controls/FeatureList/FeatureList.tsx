// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { localization } from "@responsible-ai/localization";
import {
  getTheme,
  PrimaryButton,
  IFocusTrapZoneProps,
  IPanelProps,
  IPanelStyles,
  ISearchBoxStyles,
  ISettings,
  IStackTokens,
  IStyleFunctionOrObject,
  Checkbox,
  Customizer,
  getId,
  Layer,
  LayerHost,
  Panel,
  ScrollablePane,
  SearchBox,
  Stack,
  Text
} from "office-ui-fabric-react";
import React from "react";

export interface IFeatureListProps {
  isOpen: boolean;
  onDismiss: () => void;
  saveFeatures: (features: string[]) => void;
  features: string[];
  theme?: string;
  importances: number[];
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
  searchedFeatures: string[];
  selectedFeatures: string[];
  percents: number[];
  sortedFeatures: string[];
  enableApplyButton: boolean;
  lastAppliedFeatures: Set<string>;
}

const panelStyles: IStyleFunctionOrObject<IPanelProps, IPanelStyles> = {
  main: { zIndex: 1 }
};

export class FeatureList extends React.Component<
  IFeatureListProps,
  IFeatureListState
> {
  private layerHostId: string;
  public constructor(props: IFeatureListProps) {
    super(props);

    const percents = this.updatePercents();
    const [sortedPercents, sortedFeatures] = this.sortByPercent(percents);
    this.state = {
      enableApplyButton: false,
      lastAppliedFeatures: new Set<string>(this.props.features),
      percents: sortedPercents,
      searchedFeatures: sortedFeatures,
      selectedFeatures: this.props.features,
      sortedFeatures
    };
    this.layerHostId = getId("featuresListHost");
  }

  public componentDidUpdate(prevProps: IFeatureListProps): void {
    if (this.props.importances !== prevProps.importances) {
      const percents = this.updatePercents();
      const [sortedPercents, sortedFeatures] = this.sortByPercent(percents);
      const searchedFeatures = sortedFeatures.filter((sortedFeature) =>
        this.state.searchedFeatures.includes(sortedFeature)
      );
      this.setState({
        percents: sortedPercents,
        searchedFeatures,
        sortedFeatures
      });
    }
  }

  public render(): React.ReactNode {
    const theme = getTheme();
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
        styles={panelStyles}
      >
        <div className="featuresSelector">
          <Stack tokens={checkboxStackTokens} verticalAlign="space-around">
            <Stack.Item key="decisionTreeKey" align="start">
              <Text key="decisionTreeTextKey" variant="medium">
                {localization.ErrorAnalysis.treeMapDescription}
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
            <Customizer
              settings={(currentSettings): ISettings => ({
                ...currentSettings,
                hostId: this.layerHostId
              })}
            >
              <Layer>
                <ScrollablePane>
                  <Stack
                    tokens={checkboxStackTokens}
                    verticalAlign="space-around"
                  >
                    {this.state.searchedFeatures.map((feature) => {
                      const sortedFeatureIndex = this.state.sortedFeatures.indexOf(
                        feature
                      );
                      return (
                        <Stack.Item key={"checkboxKey" + feature}>
                          <Stack horizontal horizontalAlign="space-between">
                            <Stack.Item
                              key={"checkboxItemKey" + feature}
                              align="center"
                            >
                              <Checkbox
                                label={feature}
                                checked={this.state.selectedFeatures.includes(
                                  feature
                                )}
                                onChange={this.onChange.bind(this, feature)}
                              />
                            </Stack.Item>
                            {this.props.importances.length > 0 &&
                              this.props.importances[sortedFeatureIndex] !==
                                undefined && (
                                <Stack.Item
                                  key={"checkboxImpKey" + feature}
                                  align="center"
                                >
                                  <svg width="100px" height="6px">
                                    <g>
                                      <rect
                                        fill={theme.palette.neutralQuaternary}
                                        width="100%"
                                        height="4"
                                        rx="5"
                                      ></rect>
                                      <rect
                                        fill={theme.palette.neutralSecondary}
                                        width={`${this.state.percents[sortedFeatureIndex]}%`}
                                        height="4"
                                        rx="5"
                                      ></rect>
                                    </g>
                                  </svg>
                                </Stack.Item>
                              )}
                          </Stack>
                        </Stack.Item>
                      );
                    })}
                  </Stack>
                </ScrollablePane>
              </Layer>
            </Customizer>
            <LayerHost
              id={this.layerHostId}
              style={{
                height: "500px",
                overflow: "hidden",
                position: "relative"
              }}
            />
            <Stack.Item key="applyButtonKey" align="start">
              <PrimaryButton
                text="Apply"
                onClick={this.apply.bind(this)}
                allowDisabledFocus
                disabled={!this.state.enableApplyButton}
                checked={false}
              />
            </Stack.Item>
          </Stack>
        </div>
      </Panel>
    );
  }

  private updatePercents(): number[] {
    let percents: number[] = [];
    if (this.props.importances && this.props.importances.length > 0) {
      const maxImportance = this.props.importances.reduce(
        (featImp1: number, featImp2: number) => Math.max(featImp1, featImp2)
      );
      percents = this.props.importances.map(
        (imp: number) => (imp / maxImportance) * 100
      );
    }
    return percents;
  }

  private sortByPercent(percents: number[]): [number[], string[]] {
    let sortedPercents: number[] = [];
    let sortedFeatures: string[] = this.props.features;
    // Sort the searched features by importance
    if (percents.length > 0) {
      let joinedFeatImp: Array<[number, string]> = [];
      joinedFeatImp = percents.map((percent, i) => [
        percent,
        this.props.features[i]
      ]);
      joinedFeatImp.sort(function (left, right) {
        return left[0] > right[0] ? -1 : 1;
      });
      sortedPercents = joinedFeatImp.map((joinedVal) => joinedVal[0]);
      sortedFeatures = joinedFeatImp.map((joinedVal) => joinedVal[1]);
    }
    return [sortedPercents, sortedFeatures];
  }

  private onChange(
    feature?: string,
    _?: React.FormEvent<HTMLElement>,
    isChecked?: boolean
  ): void {
    if (isChecked) {
      if (!this.state.selectedFeatures.includes(feature!)) {
        const newSelectedFeatures = [
          ...this.state.selectedFeatures.concat([feature!])
        ];
        const enableApplyButton =
          this.state.lastAppliedFeatures.size !== newSelectedFeatures.length ||
          newSelectedFeatures.some(
            (selectedFeature) =>
              !this.state.lastAppliedFeatures.has(selectedFeature)
          );
        this.setState({
          enableApplyButton,
          selectedFeatures: newSelectedFeatures
        });
      }
    } else {
      const newSelectedFeatures = [
        ...this.state.selectedFeatures.filter(
          (stateFeature) => stateFeature !== feature!
        )
      ];
      const enableApplyButton =
        this.state.lastAppliedFeatures.size !== newSelectedFeatures.length ||
        newSelectedFeatures.some(
          (selectedFeature) =>
            !this.state.lastAppliedFeatures.has(selectedFeature)
        );
      this.setState({
        enableApplyButton,
        selectedFeatures: newSelectedFeatures
      });
    }
  }

  private onSearch(searchValue: string): void {
    this.setState({
      searchedFeatures: this.props.features.filter((feature) =>
        feature.includes(searchValue)
      )
    });
  }

  private apply(): void {
    this.props.saveFeatures(this.state.selectedFeatures);
    this.setState({
      enableApplyButton: false,
      lastAppliedFeatures: new Set<string>(this.state.selectedFeatures)
    });
  }
}
