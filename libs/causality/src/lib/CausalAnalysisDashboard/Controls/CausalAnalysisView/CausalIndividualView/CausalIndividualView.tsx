// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  defaultModelAssessmentContext,
  ICausalAnalysisData,
  ICausalAnalysisSingleData,
  LabelWithCallout,
  MissingParametersPlaceholder,
  ModelAssessmentContext
} from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";
import { Link, Stack, Text } from "office-ui-fabric-react";
import React from "react";

import { CausalAggregateChart } from "../CausalAggregateView/CausalAggregateChart";
import { CausalAggregateTable } from "../CausalAggregateView/CausalAggregateTable";
import { causalCalloutDictionary } from "../CausalCallouts/causalCalloutDictionary";

import { CausalIndividualChart } from "./CausalIndividualChart";
import { CausalIndividualStyles } from "./CausalIndividualStyles";

export interface ICausalIndividualViewProps {
  data: ICausalAnalysisData;
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
      <Stack id="causalIndividualView" grow tokens={{ padding: "l1" }}>
        <Stack.Item>
          <Text variant={"medium"} className={styles.description}>
            {localization.CausalAnalysis.IndividualView.description}
          </Text>
        </Stack.Item>
        <Stack.Item className={styles.individualChart}>
          <CausalIndividualChart onDataClick={this.handleOnClick} />
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
