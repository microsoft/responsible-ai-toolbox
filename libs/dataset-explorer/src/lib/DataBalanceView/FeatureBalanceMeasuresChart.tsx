// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Dropdown, IDropdownOption, Label, Stack, Text } from "@fluentui/react";
import {
  HeaderWithInfo,
  HeatmapHighChart,
  ITargetColumnFeatureBalanceMeasures,
  MissingParametersPlaceholder,
  tableStyles
} from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";
import _ from "lodash";
import React from "react";

import { dataBalanceTabStyles } from "./DataBalanceTab.styles";
import { FeatureBalanceMeasuresDescription } from "./FeatureBalanceMeasuresDescription";
import {
  FeatureBalanceMeasuresMap,
  getFeatureBalanceMeasuresChart
} from "./getFeatureBalanceMeasuresChart";

export interface IFeatureBalanceMeasuresProps {
  featureBalanceMeasures?: ITargetColumnFeatureBalanceMeasures;
}

export interface IFeatureBalanceMeasuresState {
  selectedLabelIndex: number;
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
      selectedLabelIndex: 0,
      selectedMeasureIndex: 0
    };
  }

  public render(): React.ReactNode {
    const featureBalanceMeasures = this.props.featureBalanceMeasures;

    const measuresLocalization =
      localization.ModelAssessment.DataBalance.FeatureBalanceMeasures;

    const headerWithInfo = (
      <HeaderWithInfo
        title={measuresLocalization.Name}
        calloutTitle={measuresLocalization.Callout.Title}
        calloutDescription={measuresLocalization.Callout.Description}
        calloutLink="https://github.com/microsoft/responsible-ai-toolbox/blob/main/docs/databalance-README.md#feature-balance-measures"
        calloutLinkText={localization.ModelAssessment.DataBalance.LearnMore}
        id="featureBalanceMeasuresHeader"
      />
    );

    if (!featureBalanceMeasures) {
      return (
        <>
          {headerWithInfo}
          <MissingParametersPlaceholder>
            {measuresLocalization.MeasuresNotComputed}
          </MissingParametersPlaceholder>
        </>
      );
    }

    const styles = dataBalanceTabStyles();

    const labelOptions = _.uniq(Object.keys(featureBalanceMeasures)).map(
      (label, index) => ({ key: index, text: label } as IDropdownOption)
    );
    const selectedLabel = labelOptions[this.state.selectedLabelIndex].text;

    if (!(selectedLabel in featureBalanceMeasures)) {
      return;
    }

    const featureOptions = _.uniq(
      Object.keys(featureBalanceMeasures[selectedLabel])
    ).map(
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
      <Stack tokens={{ childrenGap: "l1" }} id="featureBalanceMeasures">
        <Stack.Item>{headerWithInfo}</Stack.Item>

        {/* Renders the the three dropdowns, their respective headings, and the description */}
        <Stack.Item>
          <Stack horizontal tokens={{ childrenGap: "s1" }}>
            {/* Renders the Positive Label dropdown and its heading */}
            <Stack.Item>
              <Stack tokens={{ childrenGap: "s1" }}>
                <Stack.Item>
                  <Label>{measuresLocalization.LabelPicker}</Label>
                </Stack.Item>
                <Stack.Item>
                  <Dropdown
                    className={styles.dropdownMedWidth}
                    id="labelDropdown"
                    options={labelOptions}
                    selectedKey={this.state.selectedLabelIndex}
                    onChange={this.setSelectedLabel}
                    ariaLabel={measuresLocalization.LabelPicker}
                  />
                </Stack.Item>
              </Stack>
            </Stack.Item>

            {/* Renders the Feature dropdown and its heading */}
            <Stack.Item>
              <Stack tokens={{ childrenGap: "s1" }}>
                <Stack.Item>
                  <Label>{measuresLocalization.FeaturePicker}</Label>
                </Stack.Item>
                <Stack.Item>
                  <Dropdown
                    className={styles.dropdownMedWidth}
                    id="featureDropdown"
                    options={featureOptions}
                    selectedKey={this.state.selectedFeatureIndex}
                    onChange={this.setSelectedFeature}
                    ariaLabel={measuresLocalization.FeaturePicker}
                  />
                </Stack.Item>
              </Stack>
            </Stack.Item>

            {/* Renders the Measure dropdown and its heading */}
            <Stack.Item>
              <Stack tokens={{ childrenGap: "s1" }}>
                <Stack.Item>
                  <Label>{measuresLocalization.MeasurePicker}</Label>
                </Stack.Item>
                <Stack.Item>
                  <Dropdown
                    className={styles.dropdownLongWidth}
                    id="measureDropdown"
                    options={measureOptions}
                    selectedKey={this.state.selectedMeasureIndex}
                    onChange={this.setSelectedMeasure}
                    ariaLabel={measuresLocalization.MeasurePicker}
                  />
                </Stack.Item>
              </Stack>
            </Stack.Item>

            {/* Renders the description of what user chose from dropdowns */}
            <Stack.Item>
              <Stack tokens={{ childrenGap: "l1" }}>
                <Stack.Item>
                  {/* Empty placeholder so that description lines up with dropdowns */}
                  <br />
                </Stack.Item>
                <Stack.Item>
                  <FeatureBalanceMeasuresDescription
                    selectedMeasure={selectedMeasure}
                    selectedFeature={selectedFeature}
                    selectedLabel={selectedLabel}
                  />
                </Stack.Item>
              </Stack>
            </Stack.Item>
          </Stack>
        </Stack.Item>

        {/* Renders the description of the chosen measure */}
        <Stack.Item>
          {/* The description is a paragraph with the format "<bolded measure name> <measure desc>". Because the
          measure desc is long and usually wraps to a new line, a Stack containing Label and Text cannot be used. */}
          <Text className={styles.boldText}>{selectedMeasure} </Text>
          <Text>
            {FeatureBalanceMeasuresMap.get(selectedMeasure)?.Description}
          </Text>
        </Stack.Item>

        {/* Renders the chart itself */}
        <Stack.Item className={tableStyles}>
          <HeatmapHighChart
            configOverride={getFeatureBalanceMeasuresChart(
              featureBalanceMeasures,
              selectedLabel,
              selectedFeature,
              selectedMeasure
            )}
          />
        </Stack.Item>
      </Stack>
    );
  }

  private setSelectedLabel = (
    _: React.FormEvent<HTMLDivElement>,
    item?: IDropdownOption
  ): void => {
    if (typeof item?.key === "number") {
      this.setState({ selectedLabelIndex: item.key });
    }
  };

  private setSelectedFeature = (
    _: React.FormEvent<HTMLDivElement>,
    item?: IDropdownOption
  ): void => {
    if (typeof item?.key === "number") {
      this.setState({ selectedFeatureIndex: item.key });
    }
  };

  private setSelectedMeasure = (
    _: React.FormEvent<HTMLDivElement>,
    item?: IDropdownOption
  ): void => {
    if (typeof item?.key === "number") {
      this.setState({ selectedMeasureIndex: item.key });
    }
  };
}
