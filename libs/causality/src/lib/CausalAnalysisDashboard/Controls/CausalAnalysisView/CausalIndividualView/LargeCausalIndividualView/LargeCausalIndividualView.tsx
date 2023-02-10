// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Link, Stack, Text } from "@fluentui/react";
import {
  defaultModelAssessmentContext,
  ICausalAnalysisData,
  ICausalAnalysisSingleData,
  ITelemetryEvent,
  LabelWithCallout,
  LoadingSpinner,
  MissingParametersPlaceholder,
  ModelAssessmentContext,
  TelemetryEventName
} from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";
import React from "react";

import { CausalAggregateChart } from "../../CausalAggregateView/CausalAggregateChart";
import { CausalAggregateTable } from "../../CausalAggregateView/CausalAggregateTable";
import { CausalIndividualStyles } from "../CausalIndividual.styles";

import { LargeCausalIndividualChart } from "./LargeCausalIndividualChart";

export interface ILargeCausalIndividualViewProps {
  causalId: string;
  localEffects?: ICausalAnalysisSingleData[][];
  telemetryHook?: (message: ITelemetryEvent) => void;
}
interface ILargeCausalIndividualViewState {
  selectedData?: ICausalAnalysisSingleData[];
  isLocalCausalDataLoading: boolean;
}

export class LargeCausalIndividualView extends React.PureComponent<
  ILargeCausalIndividualViewProps,
  ILargeCausalIndividualViewState
> {
  public static contextType = ModelAssessmentContext;
  public context: React.ContextType<typeof ModelAssessmentContext> =
    defaultModelAssessmentContext;
  public constructor(props: ILargeCausalIndividualViewProps) {
    super(props);
    this.state = {
      isLocalCausalDataLoading: false,
      selectedData: undefined
    };
  }

  public render(): React.ReactNode {
    const styles = CausalIndividualStyles();
    return (
      <Stack
        id="largeCausalIndividualView"
        grow
        tokens={{ childrenGap: "l1", padding: "8px" }}
      >
        <Stack.Item>
          <Text variant={"medium"} className={styles.description}>
            {localization.CausalAnalysis.IndividualView.description}
          </Text>
        </Stack.Item>
        <Stack.Item className={styles.individualChart}>
          <LargeCausalIndividualChart
            causalId={this.props.causalId}
            cohort={this.context.selectedErrorCohort.cohort}
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
        {this.state.isLocalCausalDataLoading ? (
          <LoadingSpinner label={localization.Common.loading} />
        ) : (
          <Stack.Item>
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
          </Stack.Item>
        )}
      </Stack>
    );
  }
  private readonly handleOnClick = (
    isLocalCausalDataLoading: boolean,
    localCausalData?: ICausalAnalysisData
  ): void => {
    this.setState({
      isLocalCausalDataLoading,
      selectedData: localCausalData
        ? localCausalData?.local_effects?.[0]
        : undefined
    });
  };
}
