// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { getTheme } from "@fluentui/react";
import {
  defaultModelAssessmentContext,
  ICausalPolicyGains,
  ModelAssessmentContext
} from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";
import {
  AccessibleChart,
  IData,
  IPlotlyProperty,
  PlotlyThemes
} from "@responsible-ai/mlchartlib";
import React from "react";

export interface ITreatmentBarChartProps {
  title: string;
  data?: ICausalPolicyGains;
  theme?: string;
}

export class TreatmentBarChart extends React.PureComponent<ITreatmentBarChartProps> {
  public static contextType = ModelAssessmentContext;
  public context: React.ContextType<typeof ModelAssessmentContext> =
    defaultModelAssessmentContext;

  public render(): React.ReactNode {
    if (!this.props.data) {
      return <span>{localization.Counterfactuals.noData}</span>;
    }
    const plotlyProps = this.buildPlotlyProps();
    const themedProps = this.props.theme
      ? PlotlyThemes.applyTheme(plotlyProps, this.props.theme)
      : plotlyProps;
    return (
      <AccessibleChart
        plotlyProps={{
          config: themedProps.config,
          data: themedProps.data,
          layout: themedProps.layout
        }}
        theme={getTheme()}
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
        autosize: false,
        dragmode: false,
        font: {
          size: 10
        },
        hovermode: "closest",
        title: {
          text: this.props.title
        },
        xaxis: {
          automargin: true,
          title: this.context.dataset.target_column
        },
        yaxis: {
          automargin: true
        }
      }
    };
    const alwaysTreats = this.props.data?.treatment_gains
      ? Object.keys(this.props.data?.treatment_gains).map((t) =>
          localization.formatString(
            localization.CausalAnalysis.TreatmentPolicy.alwaysTreat,
            t
          )
        )
      : [];
    const xData = this.props.data?.treatment_gains
      ? [
          ...Object.values(this.props.data?.treatment_gains),
          this.props.data?.recommended_policy_gains
        ]
      : [this.props.data?.recommended_policy_gains];
    const yData = this.props.data?.treatment_gains
      ? [...alwaysTreats, localization.Counterfactuals.recommendedPolicy]
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
