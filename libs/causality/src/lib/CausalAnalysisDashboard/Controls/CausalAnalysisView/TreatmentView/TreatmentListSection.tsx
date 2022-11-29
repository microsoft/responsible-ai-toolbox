// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Label, SpinButton, Stack, Text } from "@fluentui/react";
import {
  defaultModelAssessmentContext,
  ICausalPolicy,
  ModelAssessmentContext
} from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";
import React from "react";

import { TreatmentList } from "./TreatmentList";
import { TreatmentTableStyles } from "./TreatmentTable.styles";

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
  public minCount = 1;
  public maxCount = 100;
  public context: React.ContextType<typeof ModelAssessmentContext> =
    defaultModelAssessmentContext;
  public constructor(props: ITreatmentListSectionProps) {
    super(props);
    this.state = {
      topN: "10"
    };
  }

  public render(): React.ReactNode {
    const styles = TreatmentTableStyles();
    return (
      <Stack horizontal={false} grow tokens={{ childrenGap: "l1" }}>
        <Stack.Item>
          <Label>{localization.Counterfactuals.individualTreatment}</Label>
        </Stack.Item>
        <Stack.Item>
          <Stack
            horizontal
            grow
            tokens={{ childrenGap: "l1" }}
            className={styles.treatmentList}
          >
            <Stack.Item className={styles.detailsList}>
              <Stack horizontal className={styles.spinButtonAndText}>
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
                    defaultValue={this.state.topN}
                    step={1}
                    onValidate={this.handleSpinChange}
                    onIncrement={this.onIncrement}
                    onDecrement={this.onDecrement}
                    incrementButtonAriaLabel={
                      localization.Counterfactuals.increaseByOne
                    }
                    decrementButtonAriaLabel={
                      localization.Counterfactuals.decreaseByOne
                    }
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
    let newValue = Number.parseInt(value, 10) + step;
    if (newValue < this.minCount) {
      newValue = this.minCount;
    }
    if (newValue > this.maxCount) {
      newValue = this.maxCount;
    }
    this.setState({ topN: newValue.toString() });
    return newValue.toString();
  };
  private readonly handleSpinChange = (newValue?: string): string => {
    let curVal =
      newValue && !Number.isNaN(Number.parseInt(newValue))
        ? Number.parseInt(newValue)
        : 10;
    curVal = Math.max(curVal, 1);
    if (
      this.props.data?.local_policies?.length &&
      curVal > this.props.data.local_policies.length
    ) {
      curVal = this.props.data.local_policies.length;
    }
    this.setState({ topN: curVal.toString() });
    return curVal.toString();
  };
}
