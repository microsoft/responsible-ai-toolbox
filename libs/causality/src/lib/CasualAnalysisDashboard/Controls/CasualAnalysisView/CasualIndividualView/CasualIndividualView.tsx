// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  defaultModelAssessmentContext,
  ICasualAnalysisData,
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
  selectedDataIndex?: number;
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
      selectedDataIndex: undefined
    };
  }

  public render(): React.ReactNode {
    const styles = CasualIndividualStyles();
    const selectedData =
      this.state.selectedDataIndex &&
      this.context.jointDataset.getRow(this.state.selectedDataIndex);
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
          {selectedData ? (
            <CasualAggregateTable data={this.props.data.global} />
          ) : (
            <MissingParametersPlaceholder>
              {localization.CasualAnalysis.IndividualView.dataRequired}
            </MissingParametersPlaceholder>
          )}
        </Stack.Item>
        <Stack.Item>
          {selectedData && (
            <CasualAggregateChart data={this.props.data.global} />
          )}
        </Stack.Item>
      </Stack>
    );
  }
  private readonly handleOnClick = (dataIndex: number | undefined): void => {
    this.setState({
      selectedDataIndex: dataIndex
    });
  };
}
