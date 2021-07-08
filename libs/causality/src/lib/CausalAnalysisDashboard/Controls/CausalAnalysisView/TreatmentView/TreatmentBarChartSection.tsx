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

import { TreatmentBarChart } from "./TreatmentBarChart";
import { TreatmentTableStyles } from "./TreatmentTableStyles";

export interface ITreatmentBarChartSectionProps {
  data?: ICausalPolicy;
}

export class TreatmentBarChartSection extends React.PureComponent<
  ITreatmentBarChartSectionProps
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
          <Text variant={"medium"} className={styles.header}>
            {localization.formatString(
              localization.CausalAnalysis.TreatmentPolicy.averageGain,
              "Tech support"
            )}
          </Text>
        </Stack.Item>
        <Stack.Item>
          <Stack horizontal grow tokens={{ padding: "16px 24px" }}>
            <Stack.Item className={styles.chartContainer}>
              <TreatmentBarChart data={this.props.data?.policy_gains} />
            </Stack.Item>
            <Stack.Item className={styles.description}>
              <Text variant={"medium"} className={styles.label}>
                {localization.formatString(
                  localization.CausalAnalysis.TreatmentPolicy.BarDescription,
                  "Tech support"
                )}
              </Text>
              <Text variant={"medium"} className={styles.label}>
                {localization.CausalAnalysis.TreatmentPolicy.BarText}
              </Text>
            </Stack.Item>
          </Stack>
        </Stack.Item>
      </Stack>
    );
  }
}
