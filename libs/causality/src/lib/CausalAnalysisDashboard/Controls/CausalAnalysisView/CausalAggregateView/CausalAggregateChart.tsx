// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  defaultModelAssessmentContext,
  ErrorBarChart,
  ICausalAnalysisSingleData,
  ModelAssessmentContext
} from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";
import _, { isEqual } from "lodash";
import { Text, Link, Stack } from "office-ui-fabric-react";
import React from "react";

import { CausalAggregateStyles } from "./CausalAggregateStyles";

export interface ICausalAggregateChartProps {
  data: ICausalAnalysisSingleData[];
}

export class CausalAggregateChart extends React.PureComponent<ICausalAggregateChartProps> {
  public static contextType = ModelAssessmentContext;
  public context: React.ContextType<typeof ModelAssessmentContext> =
    defaultModelAssessmentContext;

  public render(): React.ReactNode {
    const styles = CausalAggregateStyles();
    return (
      <Stack horizontal verticalFill className={styles.container}>
        <Stack.Item grow className={styles.leftPane}>
          <ErrorBarChart input={undefined} />
        </Stack.Item>
        <Stack.Item grow className={styles.rightPane}>
          <Stack horizontal={false}>
            <Stack.Item className={styles.label}>
              <Text variant={"xLarge"} className={styles.header}>
                {localization.CausalAnalysis.AggregateView.continuous}
              </Text>
              {localization.CausalAnalysis.AggregateView.continuousDescription}
            </Stack.Item>
            <Stack.Item className={styles.label}>
              <Text variant={"xLarge"} className={styles.header}>
                {localization.CausalAnalysis.AggregateView.binary}
              </Text>
              {localization.CausalAnalysis.AggregateView.binaryDescription}
            </Stack.Item>
            <Stack.Item className={styles.lasso}>
              {localization.CausalAnalysis.AggregateView.lasso}{" "}
              <Link
                href="https://econml.azurewebsites.net/spec/estimation/dml.html"
                target="_blank"
              >
                {localization.CausalAnalysis.AggregateView.here}
              </Link>
            </Stack.Item>
          </Stack>
        </Stack.Item>
      </Stack>
    );
  }

  public componentDidUpdate(prevProps: ICausalAggregateChartProps): void {
    if (!isEqual(prevProps.data, this.props.data)) {
      this.forceUpdate();
    }
  }
}
