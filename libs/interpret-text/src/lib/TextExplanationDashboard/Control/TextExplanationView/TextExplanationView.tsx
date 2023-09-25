// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IChoiceGroupOption, Stack, Text } from "@fluentui/react";
import { WeightVectorOption } from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";
import React from "react";

import { QAExplanationType, RadioKeys } from "../../CommonUtils";
import { ITextExplanationViewProps } from "../../Interfaces/IExplanationViewProps";

import {
  ITextExplanationViewState,
  componentStackTokens
} from "./ITextExplanationViewSpec";
import { SidePanelOfChart } from "./SidePanelOfChart";
import {
  calculateMaxKImportances,
  calculateTopKImportances,
  computeImportancesForAllTokens,
  computeImportancesForWeightVector,
  getOutputFeatureImportances
} from "./TextExplanationViewUtils";
import { TextInputOutputAreaWithLegend } from "./TextInputOutputAreaWithLegend";
import { TrueAndPredictedAnswerView } from "./TrueAndPredictedAnswerView";

export class TextExplanationView extends React.Component<
  ITextExplanationViewProps,
  ITextExplanationViewState
> {
  public constructor(props: ITextExplanationViewProps) {
    /*
     * Initializes the text view with its state
     */
    super(props);

    const weightVector = this.props.selectedWeightVector;
    let importances: number[] = [];
    let outputFeatureImportances: number[][] = [];
    if (this.props.isQA) {
      importances = computeImportancesForAllTokens(
        this.props.dataSummary.localExplanations as number[][][],
        true
      );
      outputFeatureImportances = getOutputFeatureImportances(
        this.props.dataSummary.localExplanations as number[][][],
        this.props.dataSummary.baseValues
      );
    } else {
      importances = computeImportancesForWeightVector(
        this.props.dataSummary.localExplanations as number[][],
        weightVector
      );
    }
    const maxK = calculateMaxKImportances(importances);
    const topK = calculateTopKImportances(importances);
    this.state = {
      importances,
      maxK,
      outputFeatureImportances,
      qaRadio: QAExplanationType.Start,
      radio: RadioKeys.All,
      selectedToken: 0,
      // default to the first token
      singleTokenImportances: this.props.dataSummary.localExplanations[0].map(
        (row) => row[0]
      ),
      // get importance for first token
      text: this.props.dataSummary.text,
      tokenIndexes: [...this.props.dataSummary.text].map((_, index) => index),
      topK
    };
  }

  public componentDidUpdate(prevProps: ITextExplanationViewProps): void {
    if (
      this.props.dataSummary.text !== prevProps.dataSummary.text ||
      this.props.dataSummary.localExplanations !==
        prevProps.dataSummary.localExplanations
    ) {
      this.updateState();
    }
  }

  public render(): React.ReactNode {
    const outputLocalExplanations =
      this.state.qaRadio === QAExplanationType.Start
        ? this.state.outputFeatureImportances[0]
        : this.state.outputFeatureImportances[1];
    const inputLocalExplanations = this.props.isQA
      ? this.state.singleTokenImportances
      : this.state.importances;
    const baseValue = this.props.isQA ? this.getBaseValue() : undefined;
    const outputFeatureValue = this.props.isQA
      ? outputLocalExplanations[this.state.selectedToken]
      : undefined;

    return (
      <Stack>
        <Stack tokens={componentStackTokens} horizontal>
          {this.props.isQA ? (
            <Text>{localization.InterpretText.View.legendTextForQA}</Text>
          ) : (
            <Text>{localization.InterpretText.View.legendText}</Text>
          )}
        </Stack>

        <Stack tokens={componentStackTokens} horizontal>
          {this.props.isQA && (
            <TrueAndPredictedAnswerView
              predictedY={this.props.dataSummary.predictedY}
              trueY={this.props.dataSummary.trueY}
            />
          )}
        </Stack>

        <TextInputOutputAreaWithLegend
          topK={this.state.topK}
          radio={this.state.radio}
          selectedToken={this.state.selectedToken}
          text={this.state.text}
          outputLocalExplanations={outputLocalExplanations}
          inputLocalExplanations={inputLocalExplanations}
          isQA={this.props.isQA}
          getSelectedWord={this.getSelectedWord}
          onSelectedTokenChange={this.onSelectedTokenChange}
        />

        <SidePanelOfChart
          text={this.state.text}
          importances={inputLocalExplanations}
          topK={this.state.topK}
          radio={this.state.radio}
          isQA={this.props.isQA}
          dataSummary={this.props.dataSummary}
          maxK={this.state.maxK}
          selectedToken={this.state.selectedToken}
          tokenIndexes={this.state.tokenIndexes}
          selectedWeightVector={this.props.selectedWeightVector}
          weightOptions={this.props.weightOptions}
          weightLabels={this.props.weightLabels}
          changeRadioButton={this.changeRadioButton}
          switchQAPrediction={this.switchQAPrediction}
          setTopK={this.setTopK}
          onWeightVectorChange={this.onWeightVectorChange}
          onSelectedTokenChange={this.onSelectedTokenChange}
          outputFeatureValue={outputFeatureValue}
          baseValue={baseValue}
          selectedTokenIndex={this.state.selectedToken}
        />
      </Stack>
    );
  }

  private updateState(): void {
    let importances: number[] = [];
    let outputFeatureImportances: number[][] = [];
    if (this.props.isQA) {
      importances = this.getTokenImportances();
      outputFeatureImportances = getOutputFeatureImportances(
        this.props.dataSummary.localExplanations as number[][][],
        this.props.dataSummary.baseValues
      );
    } else {
      importances = this.getImportances(this.props.selectedWeightVector);
    }
    const [topK, maxK] = this.getTopKMaxK(importances);
    this.setState({
      importances,
      maxK,
      outputFeatureImportances,
      selectedToken: 0,
      singleTokenImportances: this.getImportanceForSingleToken(
        this.state.selectedToken
      ),
      text: this.props.dataSummary.text,
      tokenIndexes: [...this.props.dataSummary.text].map((_, index) => index),
      topK
    });
  }

  private onWeightVectorChange = (weightOption: WeightVectorOption): void => {
    const importances = this.getImportances(weightOption);
    const [topK, maxK] = this.getTopKMaxK(importances);
    this.setState({ importances, maxK, topK });
    this.props.onWeightChange(weightOption);
  };

  private onSelectedTokenChange = (newIndex: number): void => {
    const singleTokenImportances = this.getImportanceForSingleToken(newIndex);
    this.setState({
      selectedToken: newIndex,
      singleTokenImportances
    });
  };

  private getSelectedWord = (): string => {
    return this.props.dataSummary.text[this.state.selectedToken];
  };

  private getTopKMaxK(importances: number[]): [number, number] {
    const topK = calculateTopKImportances(importances);
    const maxK = calculateMaxKImportances(importances);
    return [topK, maxK];
  }

  private getImportances(weightOption: WeightVectorOption): number[] {
    return computeImportancesForWeightVector(
      this.props.dataSummary.localExplanations as number[][],
      weightOption
    );
  }

  // for QA
  private getTokenImportances(): number[] {
    return computeImportancesForAllTokens(
      this.props.dataSummary.localExplanations as number[][][]
    );
  }

  private getImportanceForSingleToken(index: number): number[] {
    const expIndex = this.state.qaRadio === QAExplanationType.Start ? 0 : 1;
    return this.props.dataSummary.localExplanations[expIndex].map(
      (row) => row[index]
    );
  }

  private getBaseValue(): number {
    if (this.props.dataSummary.baseValues) {
      const expIndex = this.state.qaRadio === QAExplanationType.Start ? 0 : 1;
      return this.props.dataSummary.baseValues?.[expIndex][
        this.state.selectedToken
      ];
    }
    return 0;
  }

  private setTopK = (newNumber: number): void => {
    this.setState({ topK: newNumber });
  };

  private changeRadioButton = (
    _event?: React.FormEvent,
    item?: IChoiceGroupOption
  ): void => {
    if (item?.key) {
      this.setState({ radio: item.key });
    }
  };

  private switchQAPrediction = (
    _event?: React.FormEvent,
    item?: IChoiceGroupOption
  ): void => {
    if (item?.key) {
      const singleTokenImportances = this.getImportanceForSingleToken(
        this.state.selectedToken
      );
      this.setState({
        qaRadio: item.key,
        singleTokenImportances
      });
    }
  };
}
