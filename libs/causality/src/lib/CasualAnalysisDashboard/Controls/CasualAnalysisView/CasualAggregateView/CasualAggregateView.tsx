// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  defaultModelAssessmentContext,
  ICasualAnalysisData,
  ModelAssessmentContext
} from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";
import { Callout, IconButton, Link, Stack, Text } from "office-ui-fabric-react";
import React from "react";

import { CasualAggregateChart } from "./CasualAggregateChart";
import { CasualAggregateStyles } from "./CasualAggregateStyles";
import { CasualAggregateTable } from "./CasualAggregateTable";

export interface ICasualAggregateViewProps {
  data: ICasualAnalysisData;
}
interface ICasualAggregateViewState {
  showCallout: boolean;
}

export class CasualAggregateView extends React.PureComponent<
  ICasualAggregateViewProps,
  ICasualAggregateViewState
> {
  public static contextType = ModelAssessmentContext;
  public context: React.ContextType<
    typeof ModelAssessmentContext
  > = defaultModelAssessmentContext;
  constructor(props: ICasualAggregateViewProps) {
    super(props);
    this.state = {
      showCallout: false
    };
  }

  public render(): React.ReactNode {
    const styles = CasualAggregateStyles();
    const buttonId = "casualAggregateCalloutBtn";
    const labelId = "casualAggregateCalloutLabel";
    const descriptionId = "casualAggregateCalloutDesp";
    return (
      <Stack grow={true} tokens={{ padding: "16px 24px" }}>
        <Stack horizontal={false} tokens={{ childrenGap: "15px" }}>
          <Text variant={"medium"} className={styles.label}>
            {localization.CasualAnalysis.AggregateView.description}
          </Text>
          <Text variant={"medium"} className={styles.label}>
            <b>{localization.CasualAnalysis.AggregateView.directAggregate}</b>
          </Text>
          <Stack horizontal>
            <IconButton
              iconProps={{ iconName: "Info" }}
              id={buttonId}
              onClick={this.toggleInfo}
              className={styles.infoButton}
            />
            <Text variant={"medium"} className={styles.label}>
              {localization.CasualAnalysis.AggregateView.whyMust}
            </Text>
          </Stack>
          {this.state.showCallout && (
            <Callout
              className={styles.callout}
              ariaLabelledBy={labelId}
              ariaDescribedBy={descriptionId}
              role="alertdialog"
              gapSpace={0}
              target={`#${buttonId}`}
              onDismiss={this.toggleInfo}
              setInitialFocus
            >
              <Text
                block
                variant="xLarge"
                className={styles.title}
                id={labelId}
              >
                {localization.CasualAnalysis.AggregateView.unconfounding}
              </Text>
              <Text block variant="small" id={descriptionId}>
                {localization.CasualAnalysis.AggregateView.confoundingFeature}
              </Text>
              <Link
                href="http://microsoft.com"
                target="_blank"
                className={styles.link}
              >
                {localization.CasualAnalysis.AggregateView.learnMore}
              </Link>
            </Callout>
          )}
        </Stack>
        <Stack>
          <Stack.Item className={styles.table}>
            <CasualAggregateTable data={this.props.data.global} />
          </Stack.Item>
          <Stack.Item>
            <CasualAggregateChart data={this.props.data.global} />
          </Stack.Item>
        </Stack>
      </Stack>
    );
  }

  private readonly toggleInfo = (): void => {
    this.setState((prevState) => {
      return { showCallout: !prevState.showCallout };
    });
  };
}
