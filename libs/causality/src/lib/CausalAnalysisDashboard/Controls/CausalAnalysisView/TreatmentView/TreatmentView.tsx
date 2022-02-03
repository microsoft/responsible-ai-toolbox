// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { ICausalPolicy, NoData } from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";
import { Stack, Text } from "office-ui-fabric-react";
import React from "react";

import { TreatmentBarChartSection } from "./TreatmentBarChartSection";
import { TreatmentListSection } from "./TreatmentListSection";
import { TreatmentSelection } from "./TreatmentSelection";
import { TreatmentStyles } from "./TreatmentStyles";
import { TreatmentTableSection } from "./TreatmentTableSection";

export interface ITreatmentViewProps {
  data?: ICausalPolicy[];
}
export interface ITreatmentViewState {
  selectedPolicy?: ICausalPolicy;
}

export class TreatmentView extends React.Component<
  ITreatmentViewProps,
  ITreatmentViewState
> {
  public constructor(props: ITreatmentViewProps) {
    super(props);
    this.state = {
      selectedPolicy: props.data?.[0]
    };
  }
  public render(): React.ReactNode {
    const styles = TreatmentStyles();
    return this.state.selectedPolicy ? (
      <Stack id="treatmentView" horizontal={false} grow>
        <Stack.Item className={styles.header}>
          <Text variant={"medium"}>
            {localization.CausalAnalysis.TreatmentPolicy.header}
          </Text>
        </Stack.Item>
        <Stack.Item>
          <TreatmentSelection data={this.props.data} onSelect={this.onSelect} />
        </Stack.Item>
        <Stack.Item>
          <TreatmentTableSection data={this.state.selectedPolicy} />
        </Stack.Item>
        <Stack.Item />
        <Stack.Item>
          <TreatmentBarChartSection data={this.state.selectedPolicy} />
        </Stack.Item>
        <Stack.Item>
          <TreatmentListSection data={this.state.selectedPolicy} />
        </Stack.Item>
      </Stack>
    ) : (
      <NoData />
    );
  }
  private onSelect = (index: number): void => {
    if (this.props.data) {
      this.setState({
        selectedPolicy: this.props.data[index]
      });
    }
  };
}
