import { localization } from "@responsible-ai/localization";
import { FormatMetrics } from "../../util/FormatMetrics";
import { IPerformanceOption } from "../../util/PerformanceMetrics";
import { InsightsStyles } from "./Insights.styles";
import { ModelComparisonChartStyles } from "./ModelComparisonChart.styles";
import { Icon, Text } from "office-ui-fabric-react";
import React from "react";

interface IInsightsProps {
  selectedMetric: IPerformanceOption;
  selectedPerformanceKey: string;
  performanceArray: number[];
  disparityArray: number[];
}

export class Insights extends React.Component<IInsightsProps> {
  public render(): React.ReactNode {
    const styles = InsightsStyles();
    const modelCompChartStyles = ModelComparisonChartStyles();

    let minPerformance: number = Number.MAX_SAFE_INTEGER;
    let maxPerformance: number = Number.MIN_SAFE_INTEGER;
    let maxDisparity: number = Number.MIN_SAFE_INTEGER;
    let minDisparity: number = Number.MAX_SAFE_INTEGER;
    let minPerformanceIndex = 0;
    let maxPerformanceIndex = 0;
    let minDisparityIndex = 0;
    this.props.performanceArray.forEach((value, index) => {
      if (value >= maxPerformance) {
        maxPerformanceIndex = index;
        maxPerformance = value;
      }
      if (value <= minPerformance) {
        minPerformanceIndex = index;
        minPerformance = value;
      }
    });
    this.props.disparityArray.forEach((value, index) => {
      if (value >= maxDisparity) {
        maxDisparity = value;
      }
      if (value <= minDisparity) {
        minDisparityIndex = index;
        minDisparity = value;
      }
    });

    const formattedMinPerformance = FormatMetrics.formatNumbers(
      minPerformance,
      this.props.selectedPerformanceKey
    );
    const formattedMaxPerformance = FormatMetrics.formatNumbers(
      maxPerformance,
      this.props.selectedPerformanceKey
    );
    const formattedMinDisparity = FormatMetrics.formatNumbers(
      minDisparity,
      this.props.selectedPerformanceKey
    );
    const formattedMaxDisparity = FormatMetrics.formatNumbers(
      maxDisparity,
      this.props.selectedPerformanceKey
    );

    const insights2 = localization.formatString(
      localization.Fairness.ModelComparison.insightsText2,
      this.props.selectedMetric.title,
      formattedMinPerformance,
      formattedMaxPerformance,
      formattedMinDisparity,
      formattedMaxDisparity
    );

    const insights3 = localization.formatString(
      localization.Fairness.ModelComparison.insightsText3,
      this.props.selectedMetric.title.toLowerCase(),
      this.props.selectedMetric.isMinimization
        ? formattedMinPerformance
        : formattedMaxPerformance,
      FormatMetrics.formatNumbers(
        this.props.disparityArray[
          this.props.selectedMetric.isMinimization
            ? minPerformanceIndex
            : maxPerformanceIndex
        ],
        this.props.selectedPerformanceKey
      )
    );

    const insights4 = localization.formatString(
      localization.Fairness.ModelComparison.insightsText4,
      this.props.selectedMetric.title.toLowerCase(),
      FormatMetrics.formatNumbers(
        this.props.performanceArray[minDisparityIndex],
        this.props.selectedPerformanceKey
      ),
      formattedMinDisparity
    );

    return (
      <div className={modelCompChartStyles.mainRight}>
        <div className={styles.insights}>
          <Icon
            iconName="CRMCustomerInsightsApp"
            className={styles.insightsIcon}
          />
          <Text className={styles.insights} block>
            {localization.Fairness.ModelComparison.insights}
          </Text>
        </div>
        <div className={styles.insightsText}>
          <Text className={modelCompChartStyles.textSection} block>
            {insights2}
          </Text>
          <Text className={modelCompChartStyles.textSection} block>
            {insights3}
          </Text>
          <Text className={modelCompChartStyles.textSection} block>
            {insights4}
          </Text>
        </div>
        <div className={styles.downloadReport}>
          <Icon iconName="Download" className={styles.downloadIcon} />
          <Text style={{ verticalAlign: "middle" }}>
            {localization.Fairness.ModelComparison.downloadReport}
          </Text>
        </div>
      </div>
    );
  }
}
