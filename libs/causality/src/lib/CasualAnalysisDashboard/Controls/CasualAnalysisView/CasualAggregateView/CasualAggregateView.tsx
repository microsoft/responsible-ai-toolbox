// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  defaultModelAssessmentContext,
  ICasualAnalysisData,
  ModelAssessmentContext
} from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";
import { Stack, Text } from "office-ui-fabric-react";
import React from "react";

import { CasualCallout } from "../../Common/CasualCallout";

import { CasualAggregateChart } from "./CasualAggregateChart";
import { CasualAggregateStyles } from "./CasualAggregateStyles";
import { CasualAggregateTable } from "./CasualAggregateTable";

export interface ICasualAggregateViewProps {
  data: ICasualAnalysisData;
}

export class CasualAggregateView extends React.PureComponent<
  ICasualAggregateViewProps
> {
  public static contextType = ModelAssessmentContext;
  public context: React.ContextType<
    typeof ModelAssessmentContext
  > = defaultModelAssessmentContext;

  public render(): React.ReactNode {
    const styles = CasualAggregateStyles();
    return (
      <Stack grow tokens={{ padding: "16px 24px" }}>
        <Stack horizontal={false} tokens={{ childrenGap: "15px" }}>
          <Text variant={"medium"} className={styles.label}>
            {localization.CasualAnalysis.AggregateView.description}
          </Text>
          <Text variant={"medium"} className={styles.label}>
            <b>{localization.CasualAnalysis.AggregateView.directAggregate}</b>
          </Text>
          <CasualCallout />
        </Stack>
        <Stack>
          <Stack.Item className={styles.table}>
            <CasualAggregateTable data={this.props.data.global} />
          </Stack.Item>
          <Stack.Item>
            <CasualAggregateChart data={this.props.data.global} />
          </Stack.Item>
        </Stack>
      </Stack>
    );
  }
}
