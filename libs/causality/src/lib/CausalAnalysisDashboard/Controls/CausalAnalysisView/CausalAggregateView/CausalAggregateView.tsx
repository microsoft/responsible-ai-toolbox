// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  defaultModelAssessmentContext,
  ICausalAnalysisData,
  ModelAssessmentContext
} from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";
import { Stack, Text } from "office-ui-fabric-react";
import React from "react";

import { CausalCallout } from "../../Common/CausalCallout";

import { CausalAggregateChart } from "./CausalAggregateChart";
import { CausalAggregateStyles } from "./CausalAggregateStyles";
import { CausalAggregateTable } from "./CausalAggregateTable";

export interface ICausalAggregateViewProps {
  data: ICausalAnalysisData;
}

export class CausalAggregateView extends React.PureComponent<
  ICausalAggregateViewProps
> {
  public static contextType = ModelAssessmentContext;
  public context: React.ContextType<
    typeof ModelAssessmentContext
  > = defaultModelAssessmentContext;

  public render(): React.ReactNode {
    const styles = CausalAggregateStyles();
    return (
      <Stack grow tokens={{ padding: "16px 8px" }}>
        <Stack horizontal={false} tokens={{ childrenGap: "15px" }}>
          <Text variant={"medium"} className={styles.label}>
            {localization.CausalAnalysis.AggregateView.description}
          </Text>
          <Text variant={"medium"} className={styles.header}>
            {localization.CausalAnalysis.AggregateView.directAggregate}
          </Text>
          <CausalCallout />
        </Stack>
        <Stack>
          <Stack.Item className={styles.table}>
            <CausalAggregateTable data={this.props.data.global_effects} />
          </Stack.Item>
          <Stack.Item>
            <CausalAggregateChart data={this.props.data.global_effects} />
          </Stack.Item>
        </Stack>
      </Stack>
    );
  }
}
