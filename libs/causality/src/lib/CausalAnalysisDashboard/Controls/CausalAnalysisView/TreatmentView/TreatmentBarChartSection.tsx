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
import { TreatmentTableStyles } from "./TreatmentTable.styles";

export interface ITreatmentBarChartSectionProps {
  data: ICausalPolicy;
}

export class TreatmentBarChartSection extends React.PureComponent<ITreatmentBarChartSectionProps> {
  public static contextType = ModelAssessmentContext;
  public context: React.ContextType<typeof ModelAssessmentContext> =
    defaultModelAssessmentContext;

  public render(): React.ReactNode {
    const styles = TreatmentTableStyles();
    const isBinaryFeature = this.context.dataset.categorical_features.includes(
      this.props.data.treatment_feature
    );
    return (
      <Stack horizontal>
        <Stack.Item className={styles.chartContainer}>
          <TreatmentBarChart
            data={this.props.data?.policy_gains}
            title={
              isBinaryFeature
                ? localization.formatString(
                    localization.CausalAnalysis.TreatmentPolicy
                      .averageGainBinary,
                    this.props.data.treatment_feature,
                    this.props.data.control_treatment
                  )
                : localization.formatString(
                    localization.CausalAnalysis.TreatmentPolicy
                      .averageGainContinuous,
                    this.props.data.treatment_feature
                  )
            }
          />
        </Stack.Item>
        <Stack.Item className={styles.description}>
          <Text variant={"medium"} className={styles.label}>
            {isBinaryFeature
              ? localization.formatString(
                  localization.CausalAnalysis.TreatmentPolicy
                    .BarDescriptionBinary,
                  this.props.data?.treatment_feature
                )
              : localization.CausalAnalysis.TreatmentPolicy
                  .BarDescriptionContinuous}
          </Text>
          <Text variant={"medium"} className={styles.label}>
            {isBinaryFeature
              ? localization.CausalAnalysis.TreatmentPolicy.BarTextBinary
              : localization.CausalAnalysis.TreatmentPolicy.BarTextContinuous}
          </Text>
        </Stack.Item>
      </Stack>
    );
  }
}
