// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  defaultModelAssessmentContext,
  ICasualAnalysisData,
  MissingParametersPlaceholder,
  ModelAssessmentContext
} from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";
import { Callout, IconButton, Link, Stack, Text } from "office-ui-fabric-react";
import React from "react";

import { CasualAggregateChart } from "../CasualAggregateView/CasualAggregateChart";
import { CasualAggregateTable } from "../CasualAggregateView/CasualAggregateTable";

import { CasualIndividualChart } from "./CasualIndividualChart";
import { CasualIndividualStyles } from "./CasualIndividualStyles";

export interface ICasualIndividualViewProps {
  data: ICasualAnalysisData;
}
interface ICasualIndividualViewState {
  showCallout: boolean;
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
      selectedDataIndex: undefined,
      showCallout: false
    };
  }

  public render(): React.ReactNode {
    const styles = CasualIndividualStyles();
    const buttonId = "casualIndividualCalloutBtn";
    const labelId = "casualIndividualCalloutLabel";
    const descriptionId = "casualIndividualCalloutDesp";
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
            <Stack horizontal>
              <IconButton
                iconProps={{ iconName: "Info" }}
                id={buttonId}
                onClick={this.toggleInfo}
                className={styles.infoButton}
              />
              <Text variant={"medium"} className={styles.label}>
                {"Why must casual insights assume unconfoundedness?"}
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
                  {"Learn more"}
                </Link>
              </Callout>
            )}
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

  private readonly toggleInfo = (): void => {
    this.setState((prevState) => {
      return { showCallout: !prevState.showCallout };
    });
  };
  private readonly handleOnClick = (dataIndex: number | undefined): void => {
    this.setState({
      selectedDataIndex: dataIndex
    });
  };
}
