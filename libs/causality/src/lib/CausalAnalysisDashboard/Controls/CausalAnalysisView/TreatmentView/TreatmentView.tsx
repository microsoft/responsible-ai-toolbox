// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Stack, Text } from "@fluentui/react";
import {
  ICausalPolicy,
  ITelemetryEvent,
  NoData
} from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";
import React from "react";

import { TreatmentBarChartSection } from "./TreatmentBarChartSection";
import { TreatmentListSection } from "./TreatmentListSection";
import { TreatmentSelection } from "./TreatmentSelection";
import { TreatmentStyles } from "./TreatmentStyles";
import { TreatmentTableSection } from "./TreatmentTableSection";

export interface ITreatmentViewProps {
  data?: ICausalPolicy[];
  telemetryHook?: (message: ITelemetryEvent) => void;
}
export interface ITreatmentViewState {
  selectedPolicy?: ICausalPolicy;
  selectedIndex: number;
}

export class TreatmentView extends React.Component<
  ITreatmentViewProps,
  ITreatmentViewState
> {
  public constructor(props: ITreatmentViewProps) {
    super(props);
    this.state = {
      selectedIndex: 0,
      selectedPolicy: props.data?.[0]
    };
  }
  public render(): React.ReactNode {
    const styles = TreatmentStyles();
    return this.state.selectedPolicy ? (
      <Stack
        id="treatmentView"
        horizontal={false}
        grow
        tokens={{ childrenGap: "l1", padding: "8px" }}
      >
        <Stack.Item className={styles.header}>
          <Text variant={"medium"}>
            {localization.CausalAnalysis.TreatmentPolicy.header}
          </Text>
        </Stack.Item>
        <Stack.Item>
          <TreatmentSelection
            data={this.props.data}
            onSelect={this.onSelect}
            telemetryHook={this.props.telemetryHook}
          />
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

  public componentDidUpdate(prevProps: ITreatmentViewProps): void {
    if (
      prevProps.data &&
      this.props.data &&
      prevProps.data[0].local_policies &&
      this.props.data[0].local_policies
    ) {
      if (
        prevProps.data[0].local_policies.length !==
        this.props.data[0].local_policies.length
      ) {
        this.setState({
          selectedPolicy: this.props.data[this.state.selectedIndex]
        });
      }
    }
  }

  private onSelect = (index: number): void => {
    if (this.props.data) {
      this.setState({
        selectedIndex: index,
        selectedPolicy: this.props.data[index]
      });
    }
  };
}
