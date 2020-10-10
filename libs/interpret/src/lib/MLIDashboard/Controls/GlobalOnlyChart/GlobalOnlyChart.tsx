// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { localization } from "@responsible-ai/localization";
import { IDropdownOption, Icon, Slider, Text } from "office-ui-fabric-react";
import React from "react";

import { ChartTypes } from "../../ChartTypes";
import { IExplanationModelMetadata } from "../../IExplanationContext";
import { ModelExplanationUtils } from "../../ModelExplanationUtils";
import { FeatureKeys } from "../../SharedComponents/IBarChartConfig";
import { FeatureImportanceBar } from "../FeatureImportanceBar/FeatureImportanceBar";
import { globalTabStyles } from "../GlobalExplanationTab/GlobalExplanationTab.styles";
import { IGlobalSeries } from "../GlobalExplanationTab/IGlobalSeries";

export interface IGlobalOnlyChartProps {
  metadata: IExplanationModelMetadata;
  globalImportance?: number[][];
}

export interface IGlobalOnlyChartState {
  topK: number;
  sortingSeriesKey: number | string;
  sortArray: number[];
}

export class GlobalOnlyChart extends React.PureComponent<
  IGlobalOnlyChartProps,
  IGlobalOnlyChartState
> {
  private readonly featureDimension = this.props.metadata.featureNames.length;
  private readonly perClassExplanationDimension =
    this.props.globalImportance && this.props.globalImportance[0]
      ? this.props.globalImportance[0].length
      : 0;
  private readonly minK = Math.min(4, this.featureDimension);
  private classOptions: IDropdownOption[];
  // look into per_class importances when available.
  // if explanation class dimension is singular,
  private readonly globalSeries: IGlobalSeries[] =
    this.perClassExplanationDimension === 1
      ? [
          {
            colorIndex: 0,
            name: localization.Interpret.BarChart.absoluteGlobal,
            unsortedAggregateY:
              this.props.globalImportance?.map((classArray) => classArray[0]) ||
              []
          }
        ]
      : this.props.metadata.classNames.map((name, index) => {
          return {
            colorIndex: index,
            name,
            unsortedAggregateY:
              this.props.globalImportance?.map(
                (classArray) => classArray[index]
              ) || []
          };
        });

  public constructor(props: IGlobalOnlyChartProps) {
    super(props);

    this.classOptions = this.props.metadata.classNames.map(
      (className, index) => {
        return { key: index, text: className };
      }
    );
    this.classOptions.unshift({
      key: FeatureKeys.AbsoluteGlobal,
      text: localization.Interpret.BarChart.absoluteGlobal
    });
    this.state = {
      sortArray: ModelExplanationUtils.buildSortedVector(
        this.props.globalImportance || []
      ).reverse(),
      sortingSeriesKey: FeatureKeys.AbsoluteGlobal,
      topK: this.minK
    };
  }

  public render(): React.ReactNode {
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
            max={this.featureDimension}
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
            unsortedX={this.props.metadata.featureNamesAbridged}
            unsortedSeries={this.globalSeries}
            topK={this.state.topK}
          />
        </div>
      </div>
    );
  }

  private setTopK = (newValue: number): void => {
    this.setState({ topK: newValue });
  };
}
