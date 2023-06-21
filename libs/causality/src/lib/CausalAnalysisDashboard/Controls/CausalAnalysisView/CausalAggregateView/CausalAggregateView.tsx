// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Link, Stack, Text } from "@fluentui/react";
import {
  DatasetTaskType,
  defaultModelAssessmentContext,
  ICausalAnalysisSingleData,
  ITelemetryEvent,
  LabelWithCallout,
  ModelAssessmentContext,
  TelemetryEventName
} from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";
import React from "react";

import { CausalAggregateStyles } from "./CausalAggregate.styles";
import { CausalAggregateChart } from "./CausalAggregateChart";
import { CausalAggregateTable } from "./CausalAggregateTable";

export interface ICausalAggregateViewProps {
  globalEffects?: ICausalAnalysisSingleData[];
  telemetryHook?: (message: ITelemetryEvent) => void;
}

export class CausalAggregateView extends React.PureComponent<ICausalAggregateViewProps> {
  public static contextType = ModelAssessmentContext;
  public context: React.ContextType<typeof ModelAssessmentContext> =
    defaultModelAssessmentContext;

  public render(): React.ReactNode {
    const styles = CausalAggregateStyles();

    return (
      <Stack
        id="causalAggregateView"
        grow
        tokens={{ childrenGap: "l1", padding: "8px" }}
      >
        <Stack horizontal={false}>
          <Stack.Item className={styles.description}>
            <Text variant={"medium"} className={styles.label}>
              {localization.CausalAnalysis.AggregateView.description}
            </Text>
          </Stack.Item>
          <Stack.Item>
            <Text variant={"medium"} className={styles.header}>
              {localization.CausalAnalysis.AggregateView.directAggregate}
            </Text>
          </Stack.Item>
          <Stack.Item className={styles.callout}>
            <LabelWithCallout
              label={localization.CausalAnalysis.MainMenu.why}
              calloutTitle={
                localization.CausalAnalysis.AggregateView.unconfounding
              }
              type="button"
              telemetryHook={this.props.telemetryHook}
              calloutEventName={
                TelemetryEventName.AggregateCausalWhyIncludeConfoundingFeaturesCalloutClick
              }
            >
              <Text block>
                {localization.CausalAnalysis.AggregateView.confoundingFeature}
              </Text>
              <Link
                href={
                  "https://www.microsoft.com/research/project/econml/#!how-to"
                }
                target="_blank"
              >
                {localization.Interpret.ExplanationSummary.clickHere}
              </Link>
            </LabelWithCallout>
          </Stack.Item>
        </Stack>
        <Stack horizontal verticalFill className={styles.container}>
          <Stack.Item grow className={styles.leftPane}>
            <Stack horizontal={false}>
              <Stack.Item>
                <CausalAggregateTable data={this.props.globalEffects} />
              </Stack.Item>
              <Stack.Item>
                <CausalAggregateChart data={this.props.globalEffects} />
              </Stack.Item>
            </Stack>
          </Stack.Item>
          <Stack.Item grow className={styles.rightPane}>
            <Stack horizontal={false}>
              <Stack.Item className={styles.label}>
                <Text variant={"xLarge"} className={styles.header}>
                  {localization.CausalAnalysis.AggregateView.continuous}
                </Text>
                {this.getContinuousDescription()}
              </Stack.Item>
              <Stack.Item className={styles.label}>
                <Text variant={"xLarge"} className={styles.header}>
                  {localization.CausalAnalysis.AggregateView.binary}
                </Text>
                {this.getBinaryDescription()}
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
      </Stack>
    );
  }

  private getContinuousDescription(): string {
    if (this.context.dataset.task_type === DatasetTaskType.Classification) {
      let positiveClass = "1";
      if (this.context.dataset.class_names !== undefined) {
        positiveClass = this.context.dataset.class_names[1];
      }

      return localization.formatString(
        localization.CausalAnalysis.AggregateView.continuousDescription,
        positiveClass
      );
    }
    return localization.CausalAnalysis.AggregateView
      .continuousRegressionDescription;
  }

  private getBinaryDescription(): string {
    if (this.context.dataset.task_type === DatasetTaskType.Classification) {
      let positiveClass = "1";
      if (this.context.dataset.class_names !== undefined) {
        positiveClass = this.context.dataset.class_names[1];
      }
      return localization.formatString(
        localization.CausalAnalysis.AggregateView.binaryDescription,
        positiveClass
      );
    }
    return localization.CausalAnalysis.AggregateView.regressionDescription;
  }
}
