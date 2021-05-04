// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  defaultModelAssessmentContext,
  ICasualAnalysisData,
  ModelAssessmentContext
} from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";
import { ActionButton, Stack, Text } from "office-ui-fabric-react";
import React from "react";

import { CasualAggregateChart } from "../CasualAggregateView/CasualAggregateChart";
import { CasualAggregateTable } from "../CasualAggregateView/CasualAggregateTable";

import { CasualIndividualChart } from "./CasualIndividualChart";
import { CasualIndividualStyles } from "./CasualIndividualStyles";

export interface ICasualIndividualViewProps {
  data: ICasualAnalysisData;
}
interface ICasualIndividualViewState {
  showModalHelp: boolean;
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
      showModalHelp: false
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
          <CasualIndividualChart />
        </Stack.Item>
        <Stack horizontal={false} tokens={{ childrenGap: "15px" }}>
          <Text variant={"medium"} className={styles.label}>
            <b>{localization.CasualAnalysis.IndividualView.directIndividual}</b>
          </Text>
          <ActionButton onClick={this.handleOpenModalHelp}>
            <div className={styles.infoButton}>i</div>
            {localization.CasualAnalysis.IndividualView.whyMust}
          </ActionButton>
        </Stack>
        <Stack.Item className={styles.individualTable}>
          <CasualAggregateTable data={this.props.data.global} />
        </Stack.Item>
        <Stack.Item>
          <CasualAggregateChart data={this.props.data.global} />
        </Stack.Item>
      </Stack>
    );
  }

  // private readonly handleCloseModalHelp = (): void => {
  //   this.setState({ showModalHelp: false });
  // };

  private readonly handleOpenModalHelp = (): void => {
    this.setState({ showModalHelp: true });
  };
}
