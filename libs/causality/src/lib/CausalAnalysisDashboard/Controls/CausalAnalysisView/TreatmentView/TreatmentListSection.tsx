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
                    disabled
                    defaultValue={this.state.topN}
                    step={1}
                    onValidate={this.handleSpinChange.bind(this)}
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
  private handleSpinChange(newValue: string): void {
    if (!newValue) {
      newValue = "10";
    }
    this.setState({ topN: newValue });
  }
}
