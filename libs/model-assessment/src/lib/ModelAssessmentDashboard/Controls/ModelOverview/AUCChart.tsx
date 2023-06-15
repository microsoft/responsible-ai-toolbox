// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { getTheme } from "@fluentui/react";
import { PointOptionsObject, SeriesOptionsType } from "highcharts";
import React from "react";

import {
  ModelAssessmentContext,
  defaultModelAssessmentContext
} from "../../../../../../core-ui/src/lib/Context/ModelAssessmentContext";
import { BasicHighChart } from "../../../../../../core-ui/src/lib/Highchart/BasicHighChart";
import { getAUCChartOptions } from "./getAUCChartOptions";
import { ITelemetryEvent } from "../../../../../../core-ui/src/lib/util/ITelemetryEvent";
// import { modelOverviewChartStyles } from "./ModelOverviewChart.styles";
import { JointDataset, calculateAUCData } from "@responsible-ai/core-ui";

interface IAUCChartProps {
  telemetryHook?: (message: ITelemetryEvent) => void;
}

export class AUCChart extends React.PureComponent<IAUCChartProps> {
  public static contextType = ModelAssessmentContext;
  public context: React.ContextType<typeof ModelAssessmentContext> =
    defaultModelAssessmentContext;

  public render(): React.ReactNode {
    const theme = getTheme();
    // const classNames = modelOverviewChartStyles();
    const plotData = getAUCChartOptions(this.getStaticROCData(), theme);

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

    // TODO: select cohort from dropdown like confusion matrix
    let selectedCohort = this.context.baseErrorCohort;
    const AUCData = calculateAUCData(
      selectedCohort.cohort.unwrap(JointDataset.TrueYLabel),
      selectedCohort.cohort.unwrap(JointDataset.PredictedYLabel),
      []
    );
    const AUCPoints: PointOptionsObject[] = [];
    const selectedLabels: string[] = [];
    AUCData?.AUCData.forEach((row, rowIdx) =>
      row.forEach((count, colIdx) => {
        AUCPoints.push({
          value: count,
          x: colIdx,
          y: rowIdx
        });
      })
    );
    if (AUCData) {
      selectedLabels.push(...AUCData.selectedLabels);
    }

    return (
      <BasicHighChart configOverride={plotData} theme={theme} id="AUCChart" />
    );
  }

  private getStaticROCData(): SeriesOptionsType[] {
    return [
      {
        data: [
          { x: 0, y: 0 },
          { x: 0, y: 1 },
          { x: 1, y: 1 }
        ],
        // TODO: localize
        name: "Ideal",
        type: "line"
      },
      {
        data: [
          { x: 0, y: 0 },
          { x: 1, y: 1 }
        ],
        // TODO: localize
        name: "Random",
        type: "line"
      }
    ];
  }
}
