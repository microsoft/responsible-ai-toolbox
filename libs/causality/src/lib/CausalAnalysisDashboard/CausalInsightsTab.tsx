// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Pivot, PivotItem, Stack, MessageBar } from "@fluentui/react";
import {
  defaultModelAssessmentContext,
  ErrorCohort,
  ICausalAnalysisData,
  ITelemetryEvent,
  ModelAssessmentContext,
  TelemetryEventName,
  TelemetryLevels
} from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";
import React from "react";

import { CausalAnalysisOptions } from "./CausalAnalysisEnums";
import { causalInsightsStyles } from "./CausalInsights.styles";
import { CausalAnalysisView } from "./Controls/CausalAnalysisView/CausalAnalysisView";

export interface ICausalInsightsTabProps {
  data: ICausalAnalysisData;
  newCohort: ErrorCohort;
  telemetryHook?: (message: ITelemetryEvent) => void;
  onPivotChange?: (option: CausalAnalysisOptions) => void;
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
          <MessageBar>{this.getCausalMessage()}</MessageBar>
        </Stack.Item>
        <Stack.Item>
          <Stack>
            <Pivot
              onLinkClick={this.onViewTypeChange}
              overflowBehavior="menu"
              className={classNames.tabs}
            >
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
            newCohort={this.props.newCohort}
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
      this.props.telemetryHook?.({
        level: TelemetryLevels.ButtonClick,
        type: this.getTelemetryEventName(item.props.itemKey)
      });
      this.props.onPivotChange?.(item.props.itemKey as CausalAnalysisOptions);
    }
  };

  private getTelemetryEventName = (itemKey: string): TelemetryEventName => {
    switch (itemKey) {
      case CausalAnalysisOptions.Aggregate:
        return TelemetryEventName.AggregateCausalTabClick;
      case CausalAnalysisOptions.Individual:
        return TelemetryEventName.IndividualCausalTabClick;
      case CausalAnalysisOptions.Treatment:
        return TelemetryEventName.CausalTreatmentPolicyTabClick;
      default:
        return TelemetryEventName.AggregateCausalTabClick;
    }
  };

  private getCausalMessage(): string {
    if (!this.context.requestGlobalCausalEffects) {
      return localization.CausalAnalysis.MainMenu.cohortInfo;
    }
    return `The current causal effects are for cohort: ${this.props.newCohort.cohort.name}`;
  }
}
