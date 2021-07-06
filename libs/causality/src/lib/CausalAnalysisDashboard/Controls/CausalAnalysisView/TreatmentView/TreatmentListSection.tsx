// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  defaultModelAssessmentContext,
  ICausalPolicy,
  ModelAssessmentContext
} from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";
import { Stack, Text } from "office-ui-fabric-react";
import React from "react";

import { TreatmentList } from "./TreatmentList";
import { TreatmentTableStyles } from "./TreatmentTableStyles";

export interface ITreatmentListSectionProps {
  data?: ICausalPolicy;
}

export class TreatmentListSection extends React.PureComponent<
  ITreatmentListSectionProps
> {
  public static contextType = ModelAssessmentContext;
  public context: React.ContextType<
    typeof ModelAssessmentContext
  > = defaultModelAssessmentContext;

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
              <TreatmentList data={this.props.data?.local_policies} />
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
}
