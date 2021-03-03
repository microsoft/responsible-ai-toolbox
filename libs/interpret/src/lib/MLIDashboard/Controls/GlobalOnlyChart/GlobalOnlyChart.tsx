// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  ModelExplanationUtils,
  ChartTypes,
  MissingParametersPlaceholder,
  isTwoDimArray,
  IGlobalFeatureImportance
} from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";
import { Icon, Slider, Text } from "office-ui-fabric-react";
import React from "react";

import {
  defaultInterpretContext,
  InterpretContext
} from "../../context/InterpretContext";
import { FeatureKeys } from "../../SharedComponents/IBarChartConfig";
import { FeatureImportanceBar } from "../FeatureImportanceBar/FeatureImportanceBar";
import { globalTabStyles } from "../GlobalExplanationTab/GlobalExplanationTab.styles";
import { IGlobalSeries } from "../GlobalExplanationTab/IGlobalSeries";

export interface IGlobalOnlyChartState {
  topK: number;
  sortingSeriesKey: number | string;
  sortArray: number[];
  globalSeries: IGlobalSeries[];
  featureNames: string[];
}

export class GlobalOnlyChart extends React.PureComponent<
  unknown,
  IGlobalOnlyChartState
> {
  public static contextType = InterpretContext;
  public context: React.ContextType<
    typeof InterpretContext
  > = defaultInterpretContext;

  public componentDidMount(): void {
    if (
      !this.context.precomputedExplanations?.globalFeatureImportance?.scores
        ?.length
    ) {
      return;
    }
    const globalImportance = this.buildGlobalProperties(
      this.context.precomputedExplanations?.globalFeatureImportance
    );
    const perClassExplanationDimension = globalImportance[0].length || 0;
    this.setState({
      featureNames:
        this.context.precomputedExplanations.globalFeatureImportance
          .featureNames || this.context.modelMetadata.featureNamesAbridged,
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
      sortArray: ModelExplanationUtils.buildSortedVector(
        globalImportance
      ).reverse(),
      sortingSeriesKey: FeatureKeys.AbsoluteGlobal,
      topK: Math.min(
        4,
        this.context.precomputedExplanations?.globalFeatureImportance?.scores
          .length || 0
      )
    });
  }

  public render(): React.ReactNode {
    if (!this.context.precomputedExplanations?.globalFeatureImportance) {
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
              +1,
              +this.state.topK
            )}
          </Text>
          <Slider
            className={classNames.startingK}
            ariaLabel={localization.Interpret.AggregateImportance.topKFeatures}
            max={
              this.context.precomputedExplanations.globalFeatureImportance
                .scores.length
            }
            min={1}
            step={1}
            value={this.state.topK}
            onChange={this.setTopK}
            showValue={false}
          />
        </div>
        <div className={classNames.globalChartWithLegend}>
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
