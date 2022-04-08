// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  defaultModelAssessmentContext,
  ICausalAnalysisData,
  LabelWithCallout,
  ModelAssessmentContext
} from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";
import { Link, Stack, Text } from "office-ui-fabric-react";
import React from "react";

import { causalCalloutDictionary } from "../CausalCallouts/causalCalloutDictionary";

import { CausalAggregateChart } from "./CausalAggregateChart";
import { CausalAggregateStyles } from "./CausalAggregateStyles";
import { CausalAggregateTable } from "./CausalAggregateTable";

export interface ICausalAggregateViewProps {
  data: ICausalAnalysisData;
}

export class CausalAggregateView extends React.PureComponent<ICausalAggregateViewProps> {
  public static contextType = ModelAssessmentContext;
  public context: React.ContextType<typeof ModelAssessmentContext> =
    defaultModelAssessmentContext;

  public render(): React.ReactNode {
    const styles = CausalAggregateStyles();
    this.props.data.global_effects.sort((d1, d2) => d2.point - d1.point);
    return (
      <Stack id="causalAggregateView" grow tokens={{ padding: "l1" }}>
        <Stack horizontal={false}>
          <Stack.Item>
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
              calloutTitle={causalCalloutDictionary.confounding.title}
              type="button"
            >
              <Text block>
                {causalCalloutDictionary.confounding.description}
              </Text>
              <Link
                href={causalCalloutDictionary.confounding.linkUrl}
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
                <CausalAggregateTable data={this.props.data.global_effects} />
              </Stack.Item>
              <Stack.Item>
                <CausalAggregateChart data={this.props.data.global_effects} />
              </Stack.Item>
            </Stack>
          </Stack.Item>
          <Stack.Item grow className={styles.rightPane}>
            <Stack horizontal={false}>
              <Stack.Item className={styles.label}>
                <Text variant={"xLarge"} className={styles.header}>
                  {localization.CausalAnalysis.AggregateView.continuous}
                </Text>
                {
                  localization.CausalAnalysis.AggregateView
                    .continuousDescription
                }
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
      </Stack>
    );
  }
}
