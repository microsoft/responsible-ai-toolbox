// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  defaultModelAssessmentContext,
  ICausalPolicyTreeInternal,
  ICausalPolicyTreeLeaf,
  ModelAssessmentContext
} from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";
import { Stack, Text } from "office-ui-fabric-react";
import React from "react";

import { TreatmentTableStyles } from "./TreatmentTableStyles";

export interface ITreatmentTableProps {
  data?: ICausalPolicyTreeInternal | ICausalPolicyTreeLeaf;
  horizontal?: boolean;
}

export class TreatmentTable extends React.PureComponent<ITreatmentTableProps> {
  public static contextType = ModelAssessmentContext;
  public context: React.ContextType<
    typeof ModelAssessmentContext
  > = defaultModelAssessmentContext;

  public render(): React.ReactNode {
    const styles = TreatmentTableStyles();
    if (!this.props.data) {
      return <>No Data</>;
    }
    if (this.props.data.leaf) {
      return (
        <Stack horizontal={false} grow tokens={{ padding: "16px 24px" }}>
          <Stack.Item>
            <Text>
              {localization.formatString(
                localization.Counterfactuals.nSample,
                this.props.data.n_samples
              )}
            </Text>
          </Stack.Item>
          <Stack.Item>
            <Text>
              {localization.formatString(
                localization.Counterfactuals.treatment,
                this.props.data.treatment
              )}
            </Text>
          </Stack.Item>
        </Stack>
      );
    }
    if (!this.props.horizontal) {
      return (
        <table className={styles.table}>
          <tr>
            <th className={styles.cell}>
              {localization.formatString(
                localization.Counterfactuals.treatmentLeft,
                this.props.data.feature,
                this.props.data.threshold
              )}
            </th>
            <th>
              <TreatmentTable
                data={this.props.data.left}
                horizontal={!this.props.horizontal}
              />
            </th>
          </tr>
          <tr>
            <th className={styles.cell}>
              {localization.formatString(
                localization.Counterfactuals.treatmentRight,
                this.props.data.feature,
                this.props.data.threshold
              )}
            </th>
            <th>
              <TreatmentTable
                data={this.props.data.right}
                horizontal={!this.props.horizontal}
              />
            </th>
          </tr>
        </table>
      );
    }
    return (
      <table className={styles.cell}>
        <tr>
          <th className={styles.cell}>
            {localization.formatString(
              localization.Counterfactuals.treatmentLeft,
              this.props.data.feature,
              this.props.data.threshold
            )}
          </th>
          <th className={styles.cell}>
            {localization.formatString(
              localization.Counterfactuals.treatmentRight,
              this.props.data.feature,
              this.props.data.threshold
            )}
          </th>
        </tr>
        <tr>
          <th>
            <TreatmentTable
              data={this.props.data.left}
              horizontal={!this.props.horizontal}
            />
          </th>
          <th>
            <TreatmentTable
              data={this.props.data.right}
              horizontal={!this.props.horizontal}
            />
          </th>
        </tr>
      </table>
    );
  }
}
