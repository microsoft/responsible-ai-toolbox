// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Icon, Slider, Text } from "@fluentui/react";
import {
  ModelExplanationUtils,
  ChartTypes,
  MissingParametersPlaceholder,
  isTwoDimArray,
  IGlobalFeatureImportance,
  ModelAssessmentContext,
  defaultModelAssessmentContext,
  FeatureImportanceBar
} from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";
import React from "react";

import { globalTabStyles } from "../GlobalExplanationTab/GlobalExplanationTab.styles";
import { IGlobalSeries } from "../GlobalExplanationTab/IGlobalSeries";

export interface IGlobalOnlyChartState {
  topK: number;
  sortArray: number[];
  globalSeries: IGlobalSeries[];
  featureNames: string[];
}

export class GlobalOnlyChart extends React.PureComponent<
  unknown,
  IGlobalOnlyChartState
> {
  public static contextType = ModelAssessmentContext;
  public context: React.ContextType<typeof ModelAssessmentContext> =
    defaultModelAssessmentContext;

  public componentDidMount(): void {
    if (
      !this.context.modelExplanationData?.precomputedExplanations
        ?.globalFeatureImportance?.scores?.length
    ) {
      return;
    }
    const globalImportance = this.buildGlobalProperties(
      this.context.modelExplanationData?.precomputedExplanations
        ?.globalFeatureImportance
    );
    const perClassExplanationDimension = globalImportance[0].length || 0;
    this.setState({
      featureNames:
        this.context.modelExplanationData?.precomputedExplanations
          .globalFeatureImportance.featureNames ||
        this.context.modelMetadata.featureNames,
      globalSeries:
        perClassExplanationDimension === 1
          ? [
              {
                colorIndex: 0,
                name: localization.Interpret.BarChart.absoluteGlobal,
                unsortedAggregateY:
                  globalImportance?.map((classArray) => classArray[0]) || []
              }
            ]
          : this.context.modelMetadata.classNames.map((name, index) => {
              return {
                colorIndex: index,
                name,
                unsortedAggregateY:
                  globalImportance.map((classArray) => classArray[index]) || []
              };
            }),
      sortArray:
        ModelExplanationUtils.buildSortedVector(globalImportance).reverse(),
      topK: Math.min(
        4,
        this.context.modelExplanationData?.precomputedExplanations
          ?.globalFeatureImportance?.scores.length || 0
      )
    });
  }

  public render(): React.ReactNode {
    if (
      !this.context.modelExplanationData?.precomputedExplanations
        ?.globalFeatureImportance
    ) {
      return (
        <MissingParametersPlaceholder>
          {localization.Interpret.GlobalTab.missingParameters}
        </MissingParametersPlaceholder>
      );
    }
    if (!this.state) {
      return React.Fragment;
    }
    const classNames = globalTabStyles();
    return (
      <div className={classNames.page}>
        <div className={classNames.infoWithText}>
          <Icon iconName="Info" className={classNames.infoIcon} />
          <Text variant="medium" className={classNames.helperText}>
            {localization.Interpret.GlobalOnlyChart.helperText}
          </Text>
        </div>
        <div className={classNames.globalChartControls}>
          <Text variant="medium" className={classNames.sliderLabel}>
            {localization.formatString(
              localization.Interpret.GlobalTab.topAtoB,
              +this.state.topK
            )}
          </Text>
          <Slider
            className={classNames.startingK}
            ariaLabel={localization.Interpret.AggregateImportance.topKFeatures}
            max={
              this.context.modelExplanationData?.precomputedExplanations
                .globalFeatureImportance.scores.length
            }
            min={1}
            step={1}
            value={this.state.topK}
            onChange={this.setTopK}
            showValue={false}
          />
        </div>
        <div
          id="featureImportanceChartContainer"
          className={classNames.globalChartWithLegend}
        >
          <FeatureImportanceBar
            jointDataset={undefined}
            yAxisLabels={[
              localization.Interpret.GlobalTab.aggregateFeatureImportance
            ]}
            sortArray={this.state.sortArray}
            chartType={ChartTypes.Bar}
            unsortedX={this.state.featureNames}
            unsortedSeries={this.state.globalSeries}
            topK={this.state.topK}
          />
        </div>
      </div>
    );
  }

  private setTopK = (newValue: number): void => {
    this.setState({ topK: newValue });
  };

  private buildGlobalProperties(
    globalFeatureImportance: IGlobalFeatureImportance
  ): number[][] {
    let globalImportance: number[][];
    if (isTwoDimArray(globalFeatureImportance.scores)) {
      globalImportance = globalFeatureImportance.scores;
    } else {
      globalImportance = globalFeatureImportance.scores.map((value) => [value]);
    }
    return globalImportance;
  }
}
