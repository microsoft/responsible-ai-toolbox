// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { AccessibleChart } from "@responsible-ai/mlchartlib";
import { getTheme } from "@uifabric/styling";
import { ITheme } from "office-ui-fabric-react";
import React from "react";

import { PredictionTypes } from "../../IFairnessProps";
import { localization } from "../../Localization/localization";
import { chartColors } from "../../util/chartColors";
import { FormatMetrics } from "../../util/FormatMetrics";
import { IFairnessContext } from "../../util/IFairnessContext";
import { IState, IMetrics, BarPlotlyProps } from "../WizardReport";

interface IPerformancePlotProps {
  dashboardContext: IFairnessContext;
  metrics: IMetrics;
  nameIndex: number[];
  theme: ITheme | undefined;
}

export class PerformancePlot extends React.PureComponent<
  IPerformancePlotProps,
  IState
> {
  public render(): React.ReactNode {
    const barPlotlyProps = new BarPlotlyProps();
    const theme = getTheme();

    if (
      this.props.dashboardContext.modelMetadata.PredictionType ===
      PredictionTypes.BinaryClassification
    ) {
      barPlotlyProps.data = [
        {
          color: chartColors[0],
          hoverinfo: "skip",
          name: localization.Metrics.falsePositiveRate,
          orientation: "h",
          text: this.props.metrics.falsePositiveRates?.bins.map((num) =>
            FormatMetrics.formatNumbers(num, "false_positive_rate", false, 2)
          ),
          textposition: "auto",
          type: "bar",
          width: 0.5,
          x: this.props.metrics.falsePositiveRates?.bins,
          y: this.props.nameIndex
        } as any,
        {
          color: chartColors[1],
          hoverinfo: "skip",
          name: localization.Metrics.falseNegativeRate,
          orientation: "h",
          text: this.props.metrics.falseNegativeRates?.bins.map((num) =>
            FormatMetrics.formatNumbers(num, "false_negative_rate", false, 2)
          ),
          textposition: "auto",
          type: "bar",
          width: 0.5,
          x: this.props.metrics.falseNegativeRates?.bins.map((x) => -1 * x),
          y: this.props.nameIndex
        }
      ];
      // Annotations for both sides of the chart
      if (barPlotlyProps.layout) {
        barPlotlyProps.layout.annotations = [
          {
            font: {
              color: theme.semanticColors.bodySubtext,
              size: 10
            },
            showarrow: false,
            text: localization.Report.falseNegativeRate,
            x: 0.02,
            xref: "paper",
            y: 1,
            yref: "paper"
          },
          {
            font: {
              color: theme.semanticColors.bodySubtext,
              size: 10
            },
            showarrow: false,
            text: localization.Report.falsePositiveRate,
            x: 0.98,
            xref: "paper",
            y: 1,
            yref: "paper"
          }
        ];
      }
      if (barPlotlyProps.layout?.xaxis) {
        barPlotlyProps.layout.xaxis.tickformat = ",.0%";
      }
    }
    if (
      this.props.dashboardContext.modelMetadata.PredictionType ===
      PredictionTypes.Probability
    ) {
      barPlotlyProps.data = [
        {
          color: chartColors[0],
          hoverinfo: "skip",
          name: localization.Metrics.overprediction,
          orientation: "h",
          text: this.props.metrics.overpredictions?.bins.map((num) =>
            FormatMetrics.formatNumbers(num, "overprediction", false, 2)
          ),
          textposition: "auto",
          type: "bar",
          width: 0.5,
          x: this.props.metrics.overpredictions?.bins,
          y: this.props.nameIndex
        } as any,
        {
          color: chartColors[1],
          hoverinfo: "skip",
          name: localization.Metrics.underprediction,
          orientation: "h",
          text: this.props.metrics.underpredictions?.bins.map((num) =>
            FormatMetrics.formatNumbers(num, "underprediction", false, 2)
          ),
          textposition: "auto",
          type: "bar",
          width: 0.5,
          x: this.props.metrics.underpredictions?.bins.map((x) => -1 * x),
          y: this.props.nameIndex
        }
      ];
      if (barPlotlyProps.layout) {
        barPlotlyProps.layout.annotations = [
          {
            font: {
              color: theme.semanticColors.bodySubtext,
              size: 10
            },
            showarrow: false,
            text: localization.Report.underestimationError,
            x: 0.1,
            xref: "paper",
            y: 1,
            yref: "paper"
          },
          {
            font: {
              color: theme.semanticColors.bodySubtext,
              size: 10
            },
            showarrow: false,
            text: localization.Report.overestimationError,
            x: 0.9,
            xref: "paper",
            y: 1,
            yref: "paper"
          }
        ];
      }
    }
    if (
      this.props.dashboardContext.modelMetadata.PredictionType ===
      PredictionTypes.Regression
    ) {
      const performanceText = this.props.metrics.predictions?.map(
        (val, index) => {
          return `${localization.formatString(
            localization.Report.tooltipError,
            FormatMetrics.formatNumbers(
              this.props.metrics?.errors?.[index],
              "average",
              false,
              3
            )
          )}<br>${localization.formatString(
            localization.Report.tooltipPrediction,
            FormatMetrics.formatNumbers(val, "average", false, 3)
          )}`;
        }
      );
      barPlotlyProps.data = [
        {
          boxmean: true,
          boxpoints: "all",
          color: chartColors[0],
          hoverinfo: "text",
          hoveron: "points",
          jitter: 0.4,
          orientation: "h",
          pointpos: 0,
          text: performanceText,
          type: "box",
          x: this.props.metrics.errors,
          y: this.props.dashboardContext.binVector
        } as any
      ];
    }

    return <AccessibleChart plotlyProps={barPlotlyProps} theme={undefined} />;
  }
}
