// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  defaultModelAssessmentContext,
  ICausalPolicyGains,
  ModelAssessmentContext
} from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";
import {
  IData,
  IPlotlyProperty,
  PlotlyThemes
} from "@responsible-ai/mlchartlib";
import Plotly from "plotly.js";
import React from "react";
import Plot from "react-plotly.js";

export interface ITreatmentBarChartProps {
  data?: ICausalPolicyGains;
  theme?: string;
}

export class TreatmentBarChart extends React.PureComponent<
  ITreatmentBarChartProps
> {
  public static contextType = ModelAssessmentContext;
  public context: React.ContextType<
    typeof ModelAssessmentContext
  > = defaultModelAssessmentContext;

  public render(): React.ReactNode {
    if (!this.props.data) {
      return <>No Data</>;
    }
    const plotlyProps = this.buildPlotlyProps();
    const themedProps = this.props.theme
      ? PlotlyThemes.applyTheme(plotlyProps, this.props.theme)
      : plotlyProps;
    return (
      <Plot
        data={themedProps.data}
        layout={themedProps.layout as Plotly.Layout}
        config={themedProps.config}
      />
    );
  }
  private buildPlotlyProps(): IPlotlyProperty {
    const plotlyProps: IPlotlyProperty = {
      config: {
        displaylogo: false,
        displayModeBar: false,
        responsive: true
      },
      data: [],
      layout: {
        autosize: true,
        dragmode: false,
        font: {
          size: 10
        },
        hovermode: "closest",
        xaxis: {
          automargin: true,
          title: this.context.dataset.target_column
        },
        yaxis: {
          automargin: true
        }
      }
    };
    const xData = this.props.data?.treatment_gains
      ? [
          ...Object.values(this.props.data?.treatment_gains),
          this.props.data?.recommended_policy_gains
        ]
      : [this.props.data?.recommended_policy_gains];
    const yData = this.props.data?.treatment_gains
      ? [
          ...Object.keys(this.props.data?.treatment_gains),
          localization.Counterfactuals.recommendedPolicy
        ]
      : [localization.Counterfactuals.recommendedPolicy];
    const trace = {
      orientation: "h",
      type: "bar",
      x: xData,
      y: yData
    } as IData;
    plotlyProps.data = [trace];
    return plotlyProps;
  }
}
