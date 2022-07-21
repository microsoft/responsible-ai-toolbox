// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Pivot, PivotItem, Stack, MessageBar } from "@fluentui/react";
import {
  defaultModelAssessmentContext,
  ICausalAnalysisData,
  ITelemetryEvent,
  ModelAssessmentContext
} from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";
import React from "react";

import { CausalAnalysisOptions } from "./CausalAnalysisEnums";
import { causalInsightsStyles } from "./CausalInsights.styles";
import { CausalAnalysisView } from "./Controls/CausalAnalysisView/CausalAnalysisView";

export interface ICausalInsightsTabProps {
  data: ICausalAnalysisData;
  telemetryHook?: (message: ITelemetryEvent) => void;
}

interface ICausalInsightsTabState {
  viewOption: string;
}
export class CausalInsightsTab extends React.PureComponent<
  ICausalInsightsTabProps,
  ICausalInsightsTabState
> {
  public static contextType = ModelAssessmentContext;
  public context: React.ContextType<typeof ModelAssessmentContext> =
    defaultModelAssessmentContext;

  public constructor(props: ICausalInsightsTabProps) {
    super(props);
    this.state = { viewOption: CausalAnalysisOptions.Aggregate };
  }

  public render(): React.ReactNode {
    const classNames = causalInsightsStyles();
    return (
      <Stack
        grow
        id="causalInsightsTab"
        tokens={{ padding: "l1" }}
        className={classNames.container}
      >
        <Stack.Item>
          <MessageBar>
            {localization.CausalAnalysis.MainMenu.cohortInfo}
          </MessageBar>
        </Stack.Item>
        <Stack.Item>
          <Stack horizontal tokens={{ childrenGap: "s1" }}>
            <Pivot onLinkClick={this.onViewTypeChange}>
              <PivotItem
                itemKey={CausalAnalysisOptions.Aggregate}
                headerText={localization.CausalAnalysis.MainMenu.aggregate}
              />
              <PivotItem
                itemKey={CausalAnalysisOptions.Individual}
                headerText={localization.CausalAnalysis.MainMenu.individual}
              />
              <PivotItem
                itemKey={CausalAnalysisOptions.Treatment}
                headerText={localization.CausalAnalysis.MainMenu.treatment}
              />
            </Pivot>
          </Stack>
        </Stack.Item>
        <Stack.Item>
          <CausalAnalysisView
            viewOption={this.state.viewOption}
            data={this.props.data}
            telemetryHook={this.props.telemetryHook}
          />
        </Stack.Item>
      </Stack>
    );
  }
  private onViewTypeChange = (item?: PivotItem): void => {
    if (
      item &&
      item.props.itemKey &&
      item.props.itemKey !== this.state.viewOption
    ) {
      this.setState({
        viewOption: item.props.itemKey
      });
    }
  };
}
