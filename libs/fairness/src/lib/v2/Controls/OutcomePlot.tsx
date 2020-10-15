import { AccessibleChart } from "@responsible-ai/mlchartlib";
import { getTheme, ITheme, Label, Stack } from "office-ui-fabric-react";
import React from "react";
import { PredictionTypes } from "../../IFairnessProps";
import { localization } from "../../Localization/localization";
import { IFairnessContext } from "../../util/IFairnessContext";
import { SummaryTable } from "../../v2/Controls/SummaryTable";
import { chartColors } from "../../util/chartColors";
import { BarPlotlyProps } from "../BarPlotlyProps";
import { IFeatureBinPickerPropsV2 } from "../FairnessWizard";
import { IMetrics } from "../IMetrics";
import { WizardReportStyles } from "../WizardReport.styles";
import { performanceOptions } from "../../util/PerformanceMetrics";
import { FormatMetrics } from "../../util/FormatMetrics";
import { ModalHelp } from "./ModalHelp";

interface IOutcomePlotProps {
  dashboardContext: IFairnessContext;
  metrics: IMetrics;
  nameIndex: number[];
  theme: ITheme | undefined;
  areaHeights: number;
  featureBinPickerProps: IFeatureBinPickerPropsV2;
}

export class OutcomePlot extends React.PureComponent<IOutcomePlotProps> {
  public render(): React.ReactNode {
    const barPlotlyProps = new BarPlotlyProps();
    const theme = getTheme();
    let styles = WizardReportStyles();
    const outcomeKey =
      this.props.dashboardContext.modelMetadata.PredictionType ===
      PredictionTypes.BinaryClassification
        ? "selection_rate"
        : "average";
    const outcomeMetric = performanceOptions[outcomeKey];
    const nameIndex = this.props.dashboardContext.groupNames.map((_, i) => i);
    let outcomeChartHeaderString: string = "";
    let outcomeChartModalHelpStrings: string[] = [];

    if (
      this.props.dashboardContext.modelMetadata.PredictionType ===
      PredictionTypes.BinaryClassification
    ) {
      barPlotlyProps.data = [
        {
          fillcolor: chartColors[0],
          hoverinfo: "skip",
          name: outcomeMetric.title,
          orientation: "h",
          text: this.props.metrics.outcomes.bins.map((num) =>
            FormatMetrics.formatNumbers(num, "selection_rate", false, 2)
          ),
          textposition: "inside",
          type: "bar",
          x: this.props.metrics.outcomes.bins,
          y: nameIndex
        }
      ];
      if (barPlotlyProps.layout?.xaxis) {
        barPlotlyProps.layout.xaxis.tickformat = ",.0%";
      }
      outcomeChartModalHelpStrings = [
        localization.Report.classificationOutcomesHowToRead
      ];
      outcomeChartHeaderString = localization.Metrics.selectionRate;
    }
    if (
      this.props.dashboardContext.modelMetadata.PredictionType ==
      PredictionTypes.Probability
    ) {
      const outcomeText = this.props.metrics.predictions?.map((val) => {
        return localization.formatString(
          localization.Report.tooltipPrediction,
          FormatMetrics.formatNumbers(val, "average", false, 3)
        );
      });
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
          text: outcomeText,
          type: "box",
          x: this.props.metrics.predictions,
          y: this.props.dashboardContext.binVector
        } as any
      ];
      outcomeChartModalHelpStrings = [
        localization.Report.regressionOutcomesHowToRead
      ];
      outcomeChartHeaderString = localization.Report.distributionOfPredictions;
    }
    if (
      this.props.dashboardContext.modelMetadata.PredictionType ===
      PredictionTypes.Regression
    ) {
      const outcomeText = this.props.metrics.predictions?.map((val) => {
        return localization.formatString(
          localization.Report.tooltipPrediction,
          val
        );
      });
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
          text: outcomeText,
          type: "box",
          x: this.props.metrics.predictions,
          y: this.props.dashboardContext.binVector
        } as any
      ];
      outcomeChartModalHelpStrings = [
        localization.Report.regressionOutcomesHowToRead
      ];
      outcomeChartHeaderString = localization.Report.distributionOfPredictions;
    }

    const formattedBinOutcomeValues = this.props.metrics.outcomes.bins.map(
      (value) => FormatMetrics.formatNumbers(value, outcomeKey)
    );

    return (
      <Stack tokens={{ padding: "0 0 0 100px" }}>
        <Label>{outcomeChartHeaderString}</Label>
        <div
          className={styles.presentationArea}
          style={{ height: `${this.props.areaHeights}px` }}
        >
          <SummaryTable
            binGroup={
              this.props.dashboardContext.modelMetadata.featureNames[
                this.props.featureBinPickerProps.selectedBinIndex
              ]
            }
            binLabels={this.props.dashboardContext.groupNames}
            formattedBinValues={formattedBinOutcomeValues}
            metricLabel={outcomeMetric.title}
            binValues={this.props.metrics.outcomes.bins}
          />
          <div className={styles.chartWrapper}>
            <Stack horizontal={true} horizontalAlign={"space-between"}>
              <div className={styles.chartSubHeader}></div>
              <ModalHelp theme={theme} strings={outcomeChartModalHelpStrings} />
            </Stack>
            <div className={styles.chartBody}>
              <AccessibleChart plotlyProps={barPlotlyProps} theme={undefined} />
            </div>
          </div>
        </div>
      </Stack>
    );
  }
}
