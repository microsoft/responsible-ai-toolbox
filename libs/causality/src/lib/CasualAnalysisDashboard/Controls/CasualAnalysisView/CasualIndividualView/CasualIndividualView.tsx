// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  defaultModelAssessmentContext,
  ICasualAnalysisData,
  ICasualAnalysisSingleData,
  MissingParametersPlaceholder,
  ModelAssessmentContext
} from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";
import { Stack, Text } from "office-ui-fabric-react";
import React from "react";

import { CasualCallout } from "../../Common/CasualCallout";
import { CasualAggregateChart } from "../CasualAggregateView/CasualAggregateChart";
import { CasualAggregateTable } from "../CasualAggregateView/CasualAggregateTable";

import { CasualIndividualChart } from "./CasualIndividualChart";
import { CasualIndividualStyles } from "./CasualIndividualStyles";

export interface ICasualIndividualViewProps {
  data: ICasualAnalysisData;
}
interface ICasualIndividualViewState {
  selectedData?: ICasualAnalysisSingleData;
}

export class CasualIndividualView extends React.PureComponent<
  ICasualIndividualViewProps,
  ICasualIndividualViewState
> {
  public static contextType = ModelAssessmentContext;
  public context: React.ContextType<
    typeof ModelAssessmentContext
  > = defaultModelAssessmentContext;
  constructor(props: ICasualIndividualViewProps) {
    super(props);
    this.state = {
      selectedData: undefined
    };
  }

  public render(): React.ReactNode {
    const styles = CasualIndividualStyles();
    return (
      <Stack grow={true} tokens={{ padding: "16px 24px" }}>
        <Stack.Item>
          <Text variant={"medium"} className={styles.label}>
            {localization.CasualAnalysis.IndividualView.description}
          </Text>
        </Stack.Item>
        <Stack.Item>
          <CasualIndividualChart onDataClick={this.handleOnClick} />
        </Stack.Item>
        <Stack.Item>
          <Stack horizontal={false} tokens={{ childrenGap: "15px" }}>
            <Text variant={"medium"} className={styles.label}>
              <b>
                {localization.CasualAnalysis.IndividualView.directIndividual}
              </b>
            </Text>
            <CasualCallout />
          </Stack>
        </Stack.Item>
        <Stack.Item className={styles.individualTable}>
          {this.state.selectedData ? (
            <CasualAggregateTable data={this.state.selectedData} />
          ) : (
            <MissingParametersPlaceholder>
              {localization.CasualAnalysis.IndividualView.dataRequired}
            </MissingParametersPlaceholder>
          )}
        </Stack.Item>
        <Stack.Item>
          {this.state.selectedData && (
            <CasualAggregateChart data={this.state.selectedData} />
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
  ): ICasualAnalysisSingleData | undefined => {
    const casualLocal = this.context?.casualAnalysisData?.local;
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
    return (localData as unknown) as ICasualAnalysisSingleData;
  };
}
