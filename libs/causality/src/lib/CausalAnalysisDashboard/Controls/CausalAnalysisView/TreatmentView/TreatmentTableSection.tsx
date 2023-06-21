// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Label, Stack, Text } from "@fluentui/react";
import {
  defaultModelAssessmentContext,
  ICausalPolicy,
  ModelAssessmentContext
} from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";
import React from "react";

import { TreatmentTable } from "./TreatmentTable";
import { TreatmentTableStyles } from "./TreatmentTable.styles";

export interface ITreatmentTableSectionProps {
  data?: ICausalPolicy;
}

export class TreatmentTableSection extends React.Component<ITreatmentTableSectionProps> {
  public static contextType = ModelAssessmentContext;
  public context: React.ContextType<typeof ModelAssessmentContext> =
    defaultModelAssessmentContext;

  public render(): React.ReactNode {
    const styles = TreatmentTableStyles();
    if (!this.props.data?.policy_tree) {
      return <div>{localization.CausalAnalysis.TreatmentPolicy.noData}</div>;
    }
    return (
      <Stack horizontal={false} grow tokens={{ childrenGap: "l1" }}>
        <Stack.Item>
          <Label>
            {localization.formatString(
              localization.CausalAnalysis.TreatmentPolicy.Size,
              this.props.data?.local_policies?.length
            )}
          </Label>
        </Stack.Item>
        <Stack.Item>
          <Stack tokens={{ padding: "l1" }} className={styles.tableWrapper}>
            <Stack.Item className={styles.leftTable}>
              <TreatmentTable data={this.props.data.policy_tree} />
            </Stack.Item>
            <Stack.Item className={styles.tableDescription}>
              <Text variant={"medium"} className={styles.label}>
                {localization.CausalAnalysis.TreatmentPolicy.TableDescription}
              </Text>
              <Text variant={"medium"} className={styles.label}>
                {localization.CausalAnalysis.TreatmentPolicy.Table}
              </Text>
            </Stack.Item>
          </Stack>
        </Stack.Item>
      </Stack>
    );
  }
}
