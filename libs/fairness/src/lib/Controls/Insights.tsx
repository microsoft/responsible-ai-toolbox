// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Icon, Stack, Text } from "@fluentui/react";
import { localization } from "@responsible-ai/localization";
import React from "react";

import { IFairnessOption } from "./../util/FairnessMetrics";
import { FormatMetrics } from "./../util/FormatMetrics";
import { IPerformanceOption } from "./../util/PerformanceMetrics";
import { InsightsStyles } from "./Insights.styles";
import { ModelComparisonChartStyles } from "./ModelComparisonChart.styles";

interface IInsightsProps {
  selectedMetric: IPerformanceOption;
  selectedFairnessMetric: IFairnessOption;
  selectedPerformanceKey: string;
  performanceArray: number[];
  fairnessArray: number[];
}

export class Insights extends React.Component<IInsightsProps> {
  public render(): React.ReactNode {
    const styles = InsightsStyles();
    const modelCompChartStyles = ModelComparisonChartStyles();

    let minPerformance: number = Number.MAX_SAFE_INTEGER;
    let maxPerformance: number = Number.MIN_SAFE_INTEGER;
    let maxFairnessValue: number = Number.MIN_SAFE_INTEGER;
    let minFairnessValue: number = Number.MAX_SAFE_INTEGER;
    let minPerformanceIndex = 0;
    let maxPerformanceIndex = 0;
    let minFairnessValueIndex = 0;
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
    this.props.fairnessArray.forEach((value, index) => {
      if (value >= maxFairnessValue) {
        maxFairnessValue = value;
      }
      if (value <= minFairnessValue) {
        minFairnessValueIndex = index;
        minFairnessValue = value;
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
    const formattedMinFairnessValue = FormatMetrics.formatNumbers(
      minFairnessValue,
      this.props.selectedPerformanceKey
    );
    const formattedMaxFairnessValue = FormatMetrics.formatNumbers(
      maxFairnessValue,
      this.props.selectedPerformanceKey
    );

    // performance metric ranges from <min> to <max>
    // disparity ranges from <min> to <max>
    const insights2 = localization.formatString(
      localization.Fairness.ModelComparison.insightsText2,
      this.props.selectedMetric.title,
      formattedMinPerformance,
      formattedMaxPerformance,
      this.props.selectedFairnessMetric.title,
      formattedMinFairnessValue,
      formattedMaxFairnessValue
    );

    // description of model with best performance
    const insights3 = localization.formatString(
      localization.Fairness.ModelComparison.insightsText3,
      this.props.selectedMetric.title.toLocaleLowerCase(),
      this.props.selectedMetric.isMinimization
        ? formattedMinPerformance
        : formattedMaxPerformance,
      this.props.selectedFairnessMetric.title.toLocaleLowerCase(),
      FormatMetrics.formatNumbers(
        this.props.fairnessArray[
          this.props.selectedMetric.isMinimization
            ? minPerformanceIndex
            : maxPerformanceIndex
        ],
        this.props.selectedPerformanceKey
      )
    );

    // description of model with best fairness metric value
    const insights4 = localization.formatString(
      localization.Fairness.ModelComparison.insightsText4,
      this.props.selectedMetric.title.toLocaleLowerCase(),
      FormatMetrics.formatNumbers(
        this.props.performanceArray[minFairnessValueIndex],
        this.props.selectedPerformanceKey
      ),
      this.props.selectedFairnessMetric.title.toLocaleLowerCase(),
      formattedMinFairnessValue
    );

    return (
      <Stack className={modelCompChartStyles.mainRight}>
        <Stack horizontal className={styles.insights}>
          <Icon
            iconName="CRMCustomerInsightsApp"
            className={styles.insightsIcon}
          />
          <Text className={styles.insights} block>
            {localization.Fairness.ModelComparison.insights}
          </Text>
        </Stack>
        <Stack>
          <Text className={styles.textSection} block>
            {insights2}
          </Text>
          <Text className={styles.textSection} block>
            {insights3}
          </Text>
          <Text className={styles.textSection} block>
            {insights4}
          </Text>
        </Stack>
        {/* download button functionality to be added:
           https://github.com/microsoft/responsible-ai-widgets/issues/66*/}
        {/* <Stack horizontal className={styles.downloadReport}>
          <Icon iconName="Download" className={styles.downloadIcon} />
          <Text style={{ verticalAlign: "middle" }}>
            {localization.Fairness.ModelComparison.downloadReport}
          </Text>
        </Stack> */}
      </Stack>
    );
  }
}
