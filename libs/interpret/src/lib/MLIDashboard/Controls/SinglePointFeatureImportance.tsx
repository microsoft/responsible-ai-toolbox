// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  IComboBoxOption,
  IComboBox,
  ComboBox,
  IDropdownOption,
  Slider
} from "@fluentui/react";
import {
  IExplanationContext,
  IsClassifier,
  ModelTypes,
  ILocalExplanation,
  ModelExplanationUtils,
  FluentUIStyles
} from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";
import _ from "lodash";
import React from "react";

import { HelpMessageDict } from "../Interfaces/IStringsParam";
import { BarChart } from "../SharedComponents/BarChart";
import {
  IBarChartConfig,
  FeatureKeys,
  FeatureSortingKey
} from "../SharedComponents/IBarChartConfig";
import { LoadingSpinner } from "../SharedComponents/LoadingSpinner";
import { NoDataMessage } from "../SharedComponents/NoDataMessage";
import { PredictionLabel } from "../SharedComponents/PredictionLabel";

import { singlePointFeatureImportanceStyles } from "./SinglePointFeatureImportance.styles";

export const localBarId = "local_bar_id";

export interface ISinglePointFeatureImportanceProps {
  explanationContext: IExplanationContext;
  selectedRow: number;
  config: IBarChartConfig;
  theme?: string;
  messages?: HelpMessageDict;
  onChange: (config: IBarChartConfig, id: string) => void;
}

export interface ISinglePointFeatureImportanceState {
  selectedSorting: FeatureSortingKey;
}

export class SinglePointFeatureImportance extends React.PureComponent<
  ISinglePointFeatureImportanceProps,
  ISinglePointFeatureImportanceState
> {
  private sortOptions: IDropdownOption[];

  public constructor(props: ISinglePointFeatureImportanceProps) {
    super(props);
    this.sortOptions = this.buildSortOptions();
    this.state = {
      selectedSorting: this.getDefaultSorting()
    };
  }

  public render(): React.ReactNode {
    const localExplanation = this.props.explanationContext.localExplanation;
    if (
      localExplanation !== undefined &&
      localExplanation.values !== undefined
    ) {
      const featuresByClassMatrix =
        this.getFeatureByClassMatrix(localExplanation);
      const sortVector = this.getSortVector(localExplanation);
      const defaultVisibleClasses =
        this.state.selectedSorting !== FeatureKeys.AbsoluteGlobal &&
        this.state.selectedSorting !== FeatureKeys.AbsoluteLocal
          ? [this.state.selectedSorting]
          : undefined;
      return (
        <div className={singlePointFeatureImportanceStyles.localSummary}>
          {this.props.explanationContext.testDataset &&
            this.props.explanationContext.testDataset.predictedY && (
              <PredictionLabel
                prediction={
                  this.props.explanationContext.testDataset.predictedY[
                    this.props.selectedRow
                  ]
                }
                classNames={
                  this.props.explanationContext.modelMetadata.classNames
                }
                modelType={
                  this.props.explanationContext.modelMetadata.modelType
                }
                predictedProbabilities={
                  this.props.explanationContext.testDataset.probabilityY
                    ? this.props.explanationContext.testDataset.probabilityY[
                        this.props.selectedRow
                      ]
                    : undefined
                }
              />
            )}
          <div
            className={
              singlePointFeatureImportanceStyles.featureBarExplanationChart
            }
          >
            <div className={singlePointFeatureImportanceStyles.topControls}>
              <Slider
                className={singlePointFeatureImportanceStyles.featureSlider}
                label={localization.Interpret.AggregateImportance.topKFeatures}
                max={Math.min(
                  30,
                  this.props.explanationContext.modelMetadata.featureNames
                    .length
                )}
                min={1}
                step={1}
                value={this.props.config.topK}
                onChange={this.setTopK}
                showValue
              />
              {this.sortOptions.length > 1 && (
                <ComboBox
                  label={localization.Interpret.BarChart.sortBy}
                  selectedKey={this.state.selectedSorting}
                  onChange={this.onSortSelect}
                  options={this.sortOptions}
                  ariaLabel={"sort selector"}
                  useComboBoxAsMenuWidth
                  styles={FluentUIStyles.smallDropdownStyle}
                />
              )}
            </div>
            <BarChart
              intercept={
                this.props.explanationContext.localExplanation?.intercepts
              }
              featureByClassMatrix={featuresByClassMatrix}
              sortedIndexVector={sortVector}
              topK={this.props.config.topK}
              modelMetadata={this.props.explanationContext.modelMetadata}
              additionalRowData={
                this.props.explanationContext.testDataset.dataset !== undefined
                  ? this.props.explanationContext.testDataset.dataset[
                      this.props.selectedRow
                    ]
                  : undefined
              }
              barmode="group"
              defaultVisibleClasses={defaultVisibleClasses}
              theme={this.props.theme}
            />
          </div>
        </div>
      );
    }
    if (
      localExplanation !== undefined &&
      localExplanation.percentComplete !== undefined
    ) {
      return <LoadingSpinner />;
    }
    const explanationStrings = this.props.messages
      ? this.props.messages.LocalExpAndTestReq
      : undefined;
    return <NoDataMessage explanationStrings={explanationStrings} />;
  }

  private getSortVector(localExplanation: ILocalExplanation): number[] {
    if (this.state.selectedSorting === FeatureKeys.AbsoluteGlobal) {
      return ModelExplanationUtils.buildSortedVector(
        this.props.explanationContext.globalExplanation
          ?.perClassFeatureImportances || []
      );
    } else if (this.state.selectedSorting === FeatureKeys.AbsoluteLocal) {
      return ModelExplanationUtils.buildSortedVector(
        localExplanation.values[this.props.selectedRow]
      );
    }
    return ModelExplanationUtils.buildSortedVector(
      localExplanation.values[this.props.selectedRow],
      this.state.selectedSorting
    );
  }

  private getFeatureByClassMatrix(
    localExplanation: ILocalExplanation
  ): number[][] {
    const result = localExplanation.values[this.props.selectedRow];
    // Binary classifier just has feature importance for class 0 stored, class one is equal and oposite.
    if (
      this.props.explanationContext.modelMetadata.modelType ===
        ModelTypes.Binary &&
      this.props.explanationContext.testDataset.predictedY !== undefined &&
      this.props.explanationContext.testDataset.predictedY[
        this.props.selectedRow
      ] !== 0
    ) {
      return result.map((classVector) =>
        classVector.map((value) => -1 * value)
      );
    }
    return result;
  }

  private buildSortOptions(): IDropdownOption[] {
    const result: IDropdownOption[] = [
      {
        key: FeatureKeys.AbsoluteGlobal,
        text: localization.Interpret.BarChart.absoluteGlobal
      }
    ];
    // if (!this.props.explanationContext.testDataset.predictedY) {
    //     return result;
    // }
    const modelType = this.props.explanationContext.modelMetadata.modelType;
    if (!IsClassifier(modelType)) {
      result.push({
        key: FeatureKeys.AbsoluteLocal,
        text: localization.Interpret.BarChart.absoluteLocal
      });
    }
    if (IsClassifier(modelType)) {
      result.push(
        ...this.props.explanationContext.modelMetadata.classNames.map(
          (className, index) => ({
            key: index,
            text: className
          })
        )
      );
    }
    return result;
  }

  private getDefaultSorting(): FeatureSortingKey {
    if (!this.props.explanationContext.testDataset.predictedY) {
      return FeatureKeys.AbsoluteGlobal;
    }
    const modelType = this.props.explanationContext.modelMetadata.modelType;
    return IsClassifier(modelType)
      ? this.props.explanationContext.testDataset.predictedY[
          this.props.selectedRow
        ]
      : FeatureKeys.AbsoluteLocal;
  }

  private setTopK = (newValue: number): void => {
    const newConfig = _.cloneDeep(this.props.config);
    newConfig.topK = newValue;
    this.props.onChange(newConfig, localBarId);
  };

  private onSortSelect = (
    _event: React.FormEvent<IComboBox>,
    item?: IComboBoxOption
  ): void => {
    if (item) {
      this.setState({ selectedSorting: item.key as FeatureSortingKey });
    }
  };
}
