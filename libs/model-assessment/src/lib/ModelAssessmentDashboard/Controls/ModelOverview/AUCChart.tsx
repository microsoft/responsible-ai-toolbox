// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Stack, StackItem, getTheme } from "@fluentui/react";
import {
  BasicHighChart,
  IDataset,
  ILabeledStatistic,
  ITelemetryEvent,
  ModelAssessmentContext,
  calculateAUCData,
  defaultModelAssessmentContext
} from "@responsible-ai/core-ui";
import React from "react";

import { getAUCChartOptions } from "./getAUCChartOptions";
import { modelOverviewChartStyles } from "./ModelOverviewChart.styles";

interface IAUCChartProps {
  dataset: IDataset;
  cohortStats: ILabeledStatistic[][];
  telemetryHook?: (message: ITelemetryEvent) => void;
}

export class AUCChart extends React.PureComponent<IAUCChartProps> {
  public static contextType = ModelAssessmentContext;
  public context: React.ContextType<typeof ModelAssessmentContext> =
    defaultModelAssessmentContext;

  public render(): React.ReactNode {
    const theme = getTheme();
    const classNames = modelOverviewChartStyles();

    if (
      this.context.dataset.predicted_y === undefined ||
      this.context.dataset.true_y === undefined
    ) {
      return React.Fragment;
    }
    const yLength = this.context.dataset.predicted_y.length;
    if (this.context.dataset.true_y.length !== yLength) {
      return React.Fragment;
    }
    const allData = calculateAUCData(this.props.dataset);
    const plotData = getAUCChartOptions(allData, theme);
    return (
      <Stack id="modelOverviewAUCChart">
        <StackItem className={classNames.chart}>
          <BasicHighChart
            configOverride={plotData}
            theme={theme}
            id="AUCChart"
          />
        </StackItem>
      </Stack>
    );
  }
}
