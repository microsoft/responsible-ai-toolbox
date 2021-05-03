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
  
import { CasualAggregateChart } from "./CasualAggregateChart";
import { CasualAggregateStyles } from "./CasualAggregateStyles";
import { CasualAggregateTable } from "./CasualAggregateTable";
  
export interface ICasualAggregateViewProps {
  data: ICasualAnalysisData;
}
interface ICasualAggregateViewState {
  showModalHelp: boolean;
}

export class CasualAggregateView extends React.PureComponent<ICasualAggregateViewProps, ICasualAggregateViewState> {
  public static contextType = ModelAssessmentContext;
  public context: React.ContextType<
    typeof ModelAssessmentContext
  > = defaultModelAssessmentContext;
  constructor(props: ICasualAggregateViewProps) {
    super(props);
    this.state = {
      showModalHelp: false
    };
  }

  public render(): React.ReactNode {
    const styles = CasualAggregateStyles();
    return (
        <Stack grow={true} tokens={{ padding: "16px 24px" }}>
          <Stack horizontal={false} tokens={{ childrenGap: "15px" }}>
            <Text variant={"medium"} className={styles.label}>
              {localization.CasualAnalysis.AggregateView.description}
            </Text>
            <Text variant={"medium"} className={styles.label}>
              <b>{localization.CasualAnalysis.AggregateView.directAggregate}</b>
            </Text>
            <ActionButton onClick={this.handleOpenModalHelp}>
              <div className={styles.infoButton}>i</div>
              {localization.CasualAnalysis.AggregateView.whyMust}
            </ActionButton>
          </Stack>
          <Stack>
            <Stack.Item className={styles.table}>
              <CasualAggregateTable data={this.props.data}/>
            </Stack.Item>
            <Stack.Item>
              <CasualAggregateChart data={this.props.data}/>
            </Stack.Item>
          </Stack>
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
  