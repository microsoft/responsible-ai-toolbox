// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Stack, DefaultButton } from "@fluentui/react";
import {
  defaultModelAssessmentContext,
  ModelAssessmentContext,
  ifEnableLargeData,
  TelemetryLevels,
  TelemetryEventName,
  ITelemetryEvent
} from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";
import React from "react";

import { localImportanceChartStyles } from "./LocalImportanceChart.styles";

export interface ILargeIndividualFeatureImportanceLegendProps {
  isBubbleChartRendered?: boolean;
  isLocalExplanationsLoading?: boolean;
  isBubbleChartDataLoading?: boolean;
  setIsRevertButtonClicked: (status: boolean) => void;
  telemetryHook?: (message: ITelemetryEvent) => void;
}

export class LargeIndividualFeatureImportanceLegend extends React.PureComponent<ILargeIndividualFeatureImportanceLegendProps> {
  public static contextType = ModelAssessmentContext;
  public context: React.ContextType<typeof ModelAssessmentContext> =
    defaultModelAssessmentContext;

  public render(): React.ReactNode {
    const classNames = localImportanceChartStyles();
    return (
      <Stack className={classNames.legendAndText}>
        {this.displayRevertButton() && (
          <DefaultButton
            className={classNames.buttonStyle}
            onClick={this.onRevertButtonClick}
            text={localization.Counterfactuals.revertToBubbleChart}
            title={localization.Counterfactuals.revertToBubbleChart}
            disabled={this.props.isLocalExplanationsLoading}
          />
        )}
      </Stack>
    );
  }

  private displayRevertButton(): boolean {
    return (
      ifEnableLargeData(this.context.dataset) &&
      !this.props.isBubbleChartRendered
    );
  }

  private onRevertButtonClick = (): void => {
    this.props.telemetryHook?.({
      level: TelemetryLevels.ButtonClick,
      type: TelemetryEventName.ViewBubblePlotButtonClicked
    });
    this.props.setIsRevertButtonClicked(true);
  };
}
