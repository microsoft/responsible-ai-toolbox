// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { getTheme } from "@fluentui/react";
import { SeriesOptionsType } from "highcharts";
import React from "react";

import {
  ModelAssessmentContext,
  defaultModelAssessmentContext
} from "../Context/ModelAssessmentContext";
import { BasicHighChart } from "../Highchart/BasicHighChart";
import { getAUCChartOptions } from "../util/getAUCChartOptions";
import { ITelemetryEvent } from "../util/ITelemetryEvent";

interface IAUCChartProps {
  telemetryHook?: (message: ITelemetryEvent) => void;
}

export class AUCChart extends React.PureComponent<IAUCChartProps> {
  public static contextType = ModelAssessmentContext;
  public context: React.ContextType<typeof ModelAssessmentContext> =
    defaultModelAssessmentContext;

  public render(): React.ReactNode {
    const theme = getTheme();
    const plotData = getAUCChartOptions(this.getStaticROCData(), theme);
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
