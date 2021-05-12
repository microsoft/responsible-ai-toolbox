// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  defaultModelAssessmentContext,
  ICausalAnalysisData,
  ICausalAnalysisSingleData,
  MissingParametersPlaceholder,
  ModelAssessmentContext
} from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";
import { Stack, Text } from "office-ui-fabric-react";
import React from "react";

import { CausalCallout } from "../../Common/CausalCallout";
import { CausalAggregateChart } from "../CausalAggregateView/CausalAggregateChart";
import { CausalAggregateTable } from "../CausalAggregateView/CausalAggregateTable";

import { CausalIndividualChart } from "./CausalIndividualChart";
import { CausalIndividualStyles } from "./CausalIndividualStyles";

export interface ICausalIndividualViewProps {
  data: ICausalAnalysisData;
}
interface ICausalIndividualViewState {
  selectedData?: ICausalAnalysisSingleData;
}

export class CausalIndividualView extends React.PureComponent<
  ICausalIndividualViewProps,
  ICausalIndividualViewState
> {
  public static contextType = ModelAssessmentContext;
  public context: React.ContextType<
    typeof ModelAssessmentContext
  > = defaultModelAssessmentContext;
  public constructor(props: ICausalIndividualViewProps) {
    super(props);
    this.state = {
      selectedData: undefined
    };
  }

  public render(): React.ReactNode {
    const styles = CausalIndividualStyles();
    return (
      <Stack grow tokens={{ padding: "16px 24px" }}>
        <Stack.Item>
          <Text variant={"medium"} className={styles.label}>
            {localization.CausalAnalysis.IndividualView.description}
          </Text>
        </Stack.Item>
        <Stack.Item>
          <CausalIndividualChart onDataClick={this.handleOnClick} />
        </Stack.Item>
        <Stack.Item>
          <Stack horizontal={false} tokens={{ childrenGap: "15px" }}>
            <Text variant={"medium"} className={styles.label}>
              <b>
                {localization.CausalAnalysis.IndividualView.directIndividual}
              </b>
            </Text>
            <CausalCallout />
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
        <Stack.Item>
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
  ): ICausalAnalysisSingleData | undefined => {
    const casualLocal = this.context?.causalAnalysisData?.local;
    if (!(dataIndex !== undefined && dataIndex >= 0 && casualLocal)) {
      return undefined;
    }
    const keys = Object.keys(casualLocal);
    const localData = {};
    keys.map(
      (k) =>
        (localData[k] =
          k === "name" ? casualLocal[k] : [casualLocal[k][dataIndex]])
    );
    return (localData as unknown) as ICausalAnalysisSingleData;
  };
}
