// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Dropdown, IDropdownOption, Stack, Text } from "@fluentui/react";
import {
  HeaderWithInfo,
  HeatmapHighChart,
  IFeatureBalanceMeasures
} from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";
import _ from "lodash";
import React from "react";

import { dataBalanceTabStyles } from "./DataBalanceTab.styles";
import {
  FeatureBalanceMeasuresMap,
  getFeatureBalanceMeasuresChart
} from "./getFeatureBalanceMeasuresChart";

export interface IFeatureBalanceMeasuresProps {
  featureBalanceMeasures: IFeatureBalanceMeasures;
}

export interface IFeatureBalanceMeasuresState {
  selectedFeatureIndex: number;
  selectedMeasureIndex: number;
}

export class FeatureBalanceMeasuresChart extends React.PureComponent<
  IFeatureBalanceMeasuresProps,
  IFeatureBalanceMeasuresState
> {
  public constructor(props: IFeatureBalanceMeasuresProps) {
    super(props);

    this.state = {
      selectedFeatureIndex: 0,
      selectedMeasureIndex: 0
    };
  }

  public render(): React.ReactNode {
    const featureBalanceMeasures = this.props.featureBalanceMeasures;
    if (!featureBalanceMeasures) {
      return;
    }

    const styles = dataBalanceTabStyles();
    const measuresLocalization =
      localization.ModelAssessment.DataBalance.FeatureBalanceMeasures;

    const featureOptions = _.uniq(Object.keys(featureBalanceMeasures)).map(
      (feature, index) => ({ key: index, text: feature } as IDropdownOption)
    );
    const selectedFeature =
      featureOptions[this.state.selectedFeatureIndex].text;

    const measureOptions = [...FeatureBalanceMeasuresMap.keys()].map(
      (measure, index) => ({ key: index, text: measure } as IDropdownOption)
    );
    const selectedMeasure =
      measureOptions[this.state.selectedMeasureIndex].text;

    return (
      <Stack tokens={{ childrenGap: "l1" }}>
        <HeaderWithInfo
          title={measuresLocalization.Name}
          calloutTitle={measuresLocalization.Callout.Title}
          calloutDescription={measuresLocalization.Callout.Description}
          // TODO: Replace link with https://responsibleaitoolbox.ai/ link once docs are published there
          calloutLink="https://microsoft.github.io/SynapseML/docs/features/responsible_ai/Data%20Balance%20Analysis/#feature-balance-measures"
          calloutLinkText={localization.ModelAssessment.DataBalance.LearnMore}
        />

        {/* Renders the the two dropdowns, their respective headings, and the description */}
        <Stack.Item>
          <Stack horizontal tokens={{ childrenGap: "s1" }}>
            {/* Renders the Feature dropdown and its heading */}
            <Stack.Item>
              <Stack tokens={{ childrenGap: "s1" }}>
                <Stack.Item>
                  <Text variant="mediumPlus" className={styles.boldText}>
                    {measuresLocalization.FeaturePicker}
                  </Text>
                </Stack.Item>
                <Stack.Item>
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
                    id="featureDropdown"
                    options={featureOptions}
                    selectedKey={this.state.selectedFeatureIndex}
                    onChange={this.setSelectedFeature}
                  />
                </Stack.Item>
              </Stack>
            </Stack.Item>

            {/* Renders the Measure dropdown and its heading */}
            <Stack.Item>
              <Stack tokens={{ childrenGap: "s1" }}>
                <Stack.Item>
                  <Text variant="mediumPlus" className={styles.boldText}>
                    {measuresLocalization.MeasurePicker}
                  </Text>
                </Stack.Item>
                <Stack.Item>
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
                        width: 200
                      }
                    }}
                    id="measureDropdown"
                    options={measureOptions}
                    selectedKey={this.state.selectedMeasureIndex}
                    onChange={this.setSelectedMeasure}
                  />
                </Stack.Item>
              </Stack>
            </Stack.Item>

            {/* Renders the description of what user chose from dropdowns */}
            <Stack.Item>
              <Stack tokens={{ childrenGap: "s1" }}>
                <Stack.Item>
                  {/* Empty placeholder so that description lines up with dropdowns */}
                  <br />
                </Stack.Item>
                <Stack.Item>
                  <Text>
                    {/* Because <Text> does not support bolding single words, split it into multiple <Text>s
                        Format is: "Showing <measure> gaps on all classes of <feature>" */}
                    <Text variant="mediumPlus">
                      {measuresLocalization.Description1}
                    </Text>
                    <Text variant="mediumPlus" className={styles.boldText}>
                      {` ${selectedMeasure} `}
                    </Text>
                    <Text variant="mediumPlus">
                      {measuresLocalization.Description2}
                    </Text>
                    <Text variant="mediumPlus" className={styles.boldText}>
                      {` ${selectedFeature}`}
                    </Text>
                  </Text>
                </Stack.Item>
              </Stack>
            </Stack.Item>
          </Stack>
        </Stack.Item>

        {/* Renders the description of the chosen measure */}
        <Stack.Item>
          {/* Since measure name is bolded, the <Text>s are separate and form "<measureName> <measureDesc>" */}
          <Text variant="medium" className={styles.infoWithText}>
            <Text className={styles.boldText}>{selectedMeasure}</Text>
            <Text> </Text>
            <Text>
              {FeatureBalanceMeasuresMap.get(selectedMeasure)?.Description}
            </Text>
          </Text>
        </Stack.Item>

        {/* Renders the chart itself */}
        <Stack.Item>
          <HeatmapHighChart
            configOverride={getFeatureBalanceMeasuresChart(
              featureBalanceMeasures,
              selectedFeature,
              selectedMeasure
            )}
          />
        </Stack.Item>
      </Stack>
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
