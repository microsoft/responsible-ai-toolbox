// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  defaultModelAssessmentContext,
  ICausalPolicy,
  ModelAssessmentContext
} from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";
import { SpinButton, Stack, Text } from "office-ui-fabric-react";
import React from "react";

import { TreatmentList } from "./TreatmentList";
import { TreatmentTableStyles } from "./TreatmentTableStyles";

export interface ITreatmentListSectionProps {
  data?: ICausalPolicy;
}
interface ITreatmentListSectionState {
  topN: string;
}

export class TreatmentListSection extends React.Component<
  ITreatmentListSectionProps,
  ITreatmentListSectionState
> {
  public static contextType = ModelAssessmentContext;
  public context: React.ContextType<
    typeof ModelAssessmentContext
  > = defaultModelAssessmentContext;
  public constructor(props: ITreatmentListSectionProps) {
    super(props);
    this.state = {
      topN: "10"
    };
  }

  public render(): React.ReactNode {
    const styles = TreatmentTableStyles();
    return (
      <Stack horizontal={false} grow tokens={{ padding: "16px 24px" }}>
        <Stack.Item>
          <Text variant={"medium"} className={styles.label}>
            <b>{localization.Counterfactuals.individualTreatment}</b>
          </Text>
        </Stack.Item>
        <Stack.Item>
          <Stack horizontal grow tokens={{ padding: "16px 24px" }}>
            <Stack.Item className={styles.detailsList}>
              <Stack horizontal>
                <Stack.Item className={styles.spinButtonText}>
                  <Text variant={"medium"}>
                    {localization.formatString(
                      localization.Counterfactuals.showTop,
                      this.props.data?.treatment_feature
                    )}
                  </Text>
                </Stack.Item>
                <Stack.Item className={styles.spinButton}>
                  <SpinButton
                    min={1}
                    max={100}
                    defaultValue={this.state.topN}
                    step={1}
                    onValidate={this.handleSpinChange}
                    onIncrement={this.onIncrement}
                    onDecrement={this.onDecrement}
                    incrementButtonAriaLabel="Increase value by 1"
                    decrementButtonAriaLabel="Decrease value by 1"
                  />
                </Stack.Item>
              </Stack>
              <TreatmentList
                data={this.props.data?.local_policies}
                topN={Number.parseInt(this.state.topN)}
              />
            </Stack.Item>
            <Stack.Item className={styles.detailsListDescription}>
              <Text variant={"medium"} className={styles.label}>
                {localization.Counterfactuals.listDescription}
              </Text>
              <Text variant={"medium"} className={styles.label}>
                {localization.Counterfactuals.listChoose}
              </Text>
            </Stack.Item>
          </Stack>
        </Stack.Item>
      </Stack>
    );
  }
  private readonly onIncrement = (value: string): string => {
    return this.onStep(value, 1);
  };
  private readonly onDecrement = (value: string): string => {
    return this.onStep(value, -1);
  };
  private readonly onStep = (value: string, step: number): string => {
    if (!value || Number.isNaN(Number.parseInt(value))) {
      value = "10";
    }
    const newValue = (Number.parseInt(value, 10) + step).toString();
    this.setState({ topN: newValue });
    return newValue;
  };
  private readonly handleSpinChange = (newValue?: string): string => {
    if (!newValue || Number.isNaN(Number.parseInt(newValue))) {
      newValue = "10";
    }
    this.setState({ topN: newValue });
    return newValue;
  };
}
