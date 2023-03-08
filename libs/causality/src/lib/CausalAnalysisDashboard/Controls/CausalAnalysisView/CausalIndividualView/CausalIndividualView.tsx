// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Link, Stack, Text } from "@fluentui/react";
import {
  defaultModelAssessmentContext,
  ICausalAnalysisSingleData,
  ITelemetryEvent,
  LabelWithCallout,
  MissingParametersPlaceholder,
  ModelAssessmentContext,
  TelemetryEventName
} from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";
import React from "react";

import { CausalAggregateChart } from "../CausalAggregateView/CausalAggregateChart";
import { CausalAggregateTable } from "../CausalAggregateView/CausalAggregateTable";

import { CausalIndividualStyles } from "./CausalIndividual.styles";
import { CausalIndividualChart } from "./CausalIndividualChart";

export interface ICausalIndividualViewProps {
  localEffects?: ICausalAnalysisSingleData[][];
  telemetryHook?: (message: ITelemetryEvent) => void;
}
interface ICausalIndividualViewState {
  selectedData?: ICausalAnalysisSingleData[];
}

export class CausalIndividualView extends React.PureComponent<
  ICausalIndividualViewProps,
  ICausalIndividualViewState
> {
  public static contextType = ModelAssessmentContext;
  public context: React.ContextType<typeof ModelAssessmentContext> =
    defaultModelAssessmentContext;
  public constructor(props: ICausalIndividualViewProps) {
    super(props);
    this.state = {
      selectedData: undefined
    };
  }

  public render(): React.ReactNode {
    const styles = CausalIndividualStyles();
    return (
      <Stack
        id="causalIndividualView"
        grow
        tokens={{ childrenGap: "l1", padding: "8px" }}
      >
        <Stack.Item>
          <Text variant={"medium"} className={styles.description}>
            {localization.CausalAnalysis.IndividualView.description}
          </Text>
        </Stack.Item>
        <Stack.Item className={styles.individualChart}>
          <CausalIndividualChart
            onDataClick={this.handleOnClick}
            telemetryHook={this.props.telemetryHook}
          />
        </Stack.Item>
        <Stack.Item className={styles.header}>
          <Stack horizontal={false}>
            <Stack.Item>
              <Text variant={"medium"}>
                {localization.CausalAnalysis.IndividualView.directIndividual}
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
                  TelemetryEventName.IndividualCausalWhyIncludeConfoundingFeaturesCalloutClick
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
        </Stack.Item>
        <Stack.Item className={styles.individualTable}>
          {this.state.selectedData ? (
            <CausalAggregateTable data={this.state.selectedData} />
          ) : (
            <MissingParametersPlaceholder>
              {localization.CausalAnalysis.IndividualView.dataRequired}
            </MissingParametersPlaceholder>
          )}
        </Stack.Item>
        <Stack.Item className={styles.aggregateChart}>
          {this.state.selectedData && (
            <CausalAggregateChart data={this.state.selectedData} />
          )}
        </Stack.Item>
      </Stack>
    );
  }
  private readonly handleOnClick = (dataIndex: number | undefined): void => {
    this.setState({
      selectedData: this.getDataFromIndex(dataIndex)
    });
  };
  private readonly getDataFromIndex = (
    dataIndex: number | undefined
  ): ICausalAnalysisSingleData[] | undefined => {
    const causalLocal = this.context?.causalAnalysisData?.local_effects;
    if (!(dataIndex !== undefined && dataIndex >= 0 && causalLocal)) {
      return undefined;
    }
    return causalLocal[dataIndex].sort((d1, d2) => d2.point - d1.point);
  };
}
