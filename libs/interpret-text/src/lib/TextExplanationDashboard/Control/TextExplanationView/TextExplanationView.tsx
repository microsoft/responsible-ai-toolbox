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
    const importances = this.props.isQA
      ? computeImportancesForAllTokens(
          this.props.dataSummary.localExplanations,
          true
        )
      : computeImportancesForWeightVector(
          this.props.dataSummary.localExplanations,
          weightVector
        );

    const maxK = calculateMaxKImportances(importances);
    const topK = calculateTopKImportances(importances);
    this.state = {
      importances,
      maxK,
      outputFeatureImportances: getOutputFeatureImportances(
        this.props.dataSummary.localExplanations,
        this.props.dataSummary.baseValues
      ),
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
      if (this.props.isQA) {
        this.setState(
          {
            selectedToken: 0,
            tokenIndexes: [...this.props.dataSummary.text].map(
              (_, index) => index
            )
          },
          () => {
            this.updateTokenImportances();
            this.updateSingleTokenImportances();
          }
        );
      } else {
        this.updateImportances(this.props.selectedWeightVector);
      }
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
          outputFeatureValue={outputLocalExplanations[this.state.selectedToken]}
          baseValue={baseValue}
          selectedTokenIndex={this.state.selectedToken}
        />
      </Stack>
    );
  }

  private onWeightVectorChange = (weightOption: WeightVectorOption): void => {
    this.updateImportances(weightOption);
    this.props.onWeightChange(weightOption);
  };

  private onSelectedTokenChange = (newIndex: number): void => {
    this.setState({ selectedToken: newIndex }, () => {
      this.updateSingleTokenImportances();
    });
  };

  private getSelectedWord = (): string => {
    return this.props.dataSummary.text[this.state.selectedToken];
  };

  private updateImportances(weightOption: WeightVectorOption): void {
    const importances = computeImportancesForWeightVector(
      this.props.dataSummary.localExplanations,
      weightOption
    );

    const topK = calculateTopKImportances(importances);
    const maxK = calculateMaxKImportances(importances);
    this.setState({
      importances,
      maxK,
      text: this.props.dataSummary.text,
      topK
    });
  }

  // for QA
  private updateTokenImportances(): void {
    const importances = computeImportancesForAllTokens(
      this.props.dataSummary.localExplanations
    );
    const topK = calculateTopKImportances(importances);
    const maxK = calculateMaxKImportances(importances);
    this.setState({
      importances,
      maxK,
      text: this.props.dataSummary.text,
      topK
    });
  }

  private updateSingleTokenImportances(): void {
    const singleTokenImportances = this.getImportanceForSingleToken(
      this.state.selectedToken
    );
    this.setState({ singleTokenImportances });
  }

  private getImportanceForSingleToken(index: number): number[] {
    return this.state.qaRadio === QAExplanationType.Start
      ? this.props.dataSummary.localExplanations[0].map((row) => row[index])
      : this.props.dataSummary.localExplanations[1].map((row) => row[index]);
  }

  private getBaseValue(): number {
    if (this.props.dataSummary.baseValues) {
      const retuVal =
        this.state.qaRadio === QAExplanationType.Start
          ? this.props.dataSummary.baseValues?.[0][this.state.selectedToken]
          : this.props.dataSummary.baseValues?.[1][this.state.selectedToken];
      return retuVal;
    }
    return 0;
  }

  private setTopK = (newNumber: number): void => {
    /*
     * Changes the state of K
     */
    this.setState({ topK: newNumber });
  };

  private changeRadioButton = (
    _event?: React.FormEvent,
    item?: IChoiceGroupOption
  ): void => {
    /*
     * Changes the state of the radio button
     */
    if (item?.key !== undefined) {
      this.setState({ radio: item.key });
    }
  };

  private switchQAPrediction = (
    _event?: React.FormEvent,
    item?: IChoiceGroupOption
  ): void => {
    if (item?.key !== undefined) {
      this.setState({ qaRadio: item.key }, () => {
        this.updateSingleTokenImportances();
      });
    }
  };
}
