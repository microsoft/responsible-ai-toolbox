// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  BasicHighChart,
  FeatureBalanceMeasureInfoMap,
  getFeatureBalanceChartOptions,
  IFeatureBalanceMeasures
} from "@responsible-ai/core-ui";
import { Dropdown, IDropdownOption, Text } from "office-ui-fabric-react";
import React from "react";

import { dataBalanceTabStyles } from "./DataBalanceTab.styles";

export interface IFeatureBalanceMeasureProps {
  featureBalanceMeasures: IFeatureBalanceMeasures;
  datasetName?: string;
}

export interface IFeatureBalanceMeasureState {
  selectedFeatureIndex: number;
  selectedMeasureIndex: number;
}

export class FeatureBalanceMeasureChart extends React.PureComponent<
  IFeatureBalanceMeasureProps,
  IFeatureBalanceMeasureState
> {
  public constructor(props: IFeatureBalanceMeasureProps) {
    super(props);

    this.state = {
      selectedFeatureIndex: 0,
      selectedMeasureIndex: 0
    };
  }

  public render(): React.ReactNode {
    const featureBalanceMeasures = this.props.featureBalanceMeasures;
    if (
      !featureBalanceMeasures.featureValues ||
      !featureBalanceMeasures.measures ||
      !featureBalanceMeasures.features
    ) {
      return;
    }

    const featureOptions = featureBalanceMeasures.features.map(
      (feature, index) => ({ key: index, text: feature } as IDropdownOption)
    );
    const measureOptions = [...FeatureBalanceMeasureInfoMap].map(
      ([name, _], index) => ({ key: index, text: name } as IDropdownOption)
    );

    const styles = dataBalanceTabStyles();

    return (
      <div>
        <Text variant="large" className={styles.leftLabel}>
          {
            "Feature Balance Measures" // TODO: Replace with localization
          }
        </Text>

        <br />

        <div className={styles.featureAndMeasurePickerWrapper}>
          <Text
            variant="mediumPlus"
            className={styles.featureAndMeasurePickerLabel}
          >
            {
              "Select a dataset feature and measure to explore" // TODO: Replace with localization
            }
          </Text>

          <Dropdown
            styles={{
              callout: {
                selectors: {
                  ".ms-Button-flexContainer": {
                    width: "100%"
                  }
                }
              },
              dropdown: {
                width: 150
              }
            }}
            id="selectedFeatureDropdown"
            options={featureOptions}
            selectedKey={this.state.selectedFeatureIndex}
            onChange={this.setSelectedFeature}
          />

          <Dropdown
            styles={{
              callout: {
                selectors: {
                  ".ms-Button-flexContainer": {
                    width: "100%"
                  }
                }
              },
              dropdown: {
                width: 250
              }
            }}
            id="selectedMeasureDropdown"
            options={measureOptions}
            selectedKey={this.state.selectedMeasureIndex}
            onChange={this.setSelectedMeasure}
          />
        </div>

        <br />

        <BasicHighChart
          id="featureBalanceMeasureChart"
          configOverride={getFeatureBalanceChartOptions(
            featureBalanceMeasures,
            featureOptions[this.state.selectedFeatureIndex].text,
            measureOptions[this.state.selectedMeasureIndex].text,
            this.props.datasetName
          )}
          modules={["heatmap"]}
        />

        <br />
      </div>
    );
  }

  private setSelectedFeature = (
    _: React.FormEvent<HTMLDivElement>,
    item?: IDropdownOption
  ): void => {
    if (item?.key !== undefined) {
      this.setState({ selectedFeatureIndex: item.key as number });
    }
  };

  private setSelectedMeasure = (
    _: React.FormEvent<HTMLDivElement>,
    item?: IDropdownOption
  ): void => {
    if (item?.key !== undefined) {
      this.setState({ selectedMeasureIndex: item.key as number });
    }
  };
}
