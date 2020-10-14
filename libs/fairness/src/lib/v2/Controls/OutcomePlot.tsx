import { AccessibleChart } from "@responsible-ai/mlchartlib";
import { ITheme } from "office-ui-fabric-react";
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
    let styles = WizardReportStyles();
    // let howToReadOutcomesSection: React.ReactNode;
    const outcomeKey =
      this.props.dashboardContext.modelMetadata.PredictionType ===
      PredictionTypes.BinaryClassification
        ? "selection_rate"
        : "average";
    const outcomeMetric = performanceOptions[outcomeKey];
    const nameIndex = this.props.dashboardContext.groupNames.map((_, i) => i);

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
      //   howToReadOutcomesSection = (
      //     <Text className={styles.textRow} block>
      //       {localization.Report.classificationOutcomesHowToRead}
      //     </Text>
      //   );
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
      //   howToReadOutcomesSection = (
      //     <div>
      //       <Text className={styles.textRow} block>
      //         {localization.Report.regressionOutcomesHowToRead}
      //       </Text>
      //     </div>
      //   );
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
      //   howToReadOutcomesSection = (
      //     <div>
      //       <Text className={styles.textRow} block>
      //         {localization.Report.regressionOutcomesHowToRead}
      //       </Text>
      //     </div>
      //   );
    }

    const formattedBinOutcomeValues = this.props.metrics.outcomes.bins.map(
      (value) => FormatMetrics.formatNumbers(value, outcomeKey)
    );

    return (
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
          <div className={styles.chartHeader}></div>
          <div className={styles.chartBody}>
            <AccessibleChart plotlyProps={barPlotlyProps} theme={undefined} />
          </div>
        </div>
        {/* <div className={styles.mainRight}>
          <div className={styles.insights}>
            <Icon
              iconName="CRMCustomerInsightsApp"
              className={styles.insightsIcon}
            />
            <Text style={{ verticalAlign: "middle" }}>
              {localization.ModelComparison.insights}
            </Text>
          </div>
          <div className={styles.insightsText}>{howToReadOutcomesSection}</div>
          <div className={styles.downloadReport}>
            <Icon iconName="Download" className={styles.downloadIcon} />
            <Text style={{ verticalAlign: "middle" }}>
              {localization.ModelComparison.downloadReport}
            </Text>
          </div>
        </div> */}
      </div>
    );
  }
}
