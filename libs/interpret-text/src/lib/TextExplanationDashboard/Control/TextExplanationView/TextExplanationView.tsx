// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IChoiceGroupOption, Stack, Text } from "@fluentui/react";
import { WeightVectorOption, WeightVectors } from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";
import React from "react";

import { QAExplanationType, RadioKeys, Utils } from "../../CommonUtils";
import { ITextExplanationViewProps } from "../../Interfaces/IExplanationViewProps";
import { TextFeatureLegend } from "../TextFeatureLegend/TextFeatureLegend";
import { TextHighlighting } from "../TextHighlighting/TextHightlighting";

import {
  ITextExplanationViewState,
  MaxImportantWords,
  componentStackTokens
} from "./ITextExplanationViewSpec";
import { SidePanelOfChart } from "./SidePanelOfChart";
import { textExplanationDashboardStyles } from "./TextExplanationView.styles";

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
      ? this.computeImportancesForAllTokens(
          this.props.dataSummary.localExplanations,
          true
        )
      : this.computeImportancesForWeightVector(
          this.props.dataSummary.localExplanations,
          weightVector
        );

    const maxK = this.calculateMaxKImportances(importances);
    const topK = this.calculateTopKImportances(importances);
    this.state = {
      importances,
      maxK,
      qaRadio: QAExplanationType.Start,
      radio: RadioKeys.All,
      selectedToken: 0, // default to the first token
      singleTokenImportances: this.props.dataSummary.localExplanations[0].map(
        (row) => row[0]
      ), // get importance for first token
      text: this.props.dataSummary.text,
      tokenIndexes: [...this.props.dataSummary.text].map((_, index) => index),
      topK,
      outputFeatureImportances: this.getOutputFeatureImportances()
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
    const classNames = textExplanationDashboardStyles();

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
            <Stack horizontal={false}>
              <Stack horizontal>
                <Stack.Item>
                  <Text className={classNames.predictedAnswer}>
                    {localization.InterpretText.View.predictedAnswer} &nbsp;
                  </Text>
                </Stack.Item>
                <Stack.Item>
                  <Text className={classNames.predictedAnswer}>
                    {this.props.dataSummary.predictedY}
                  </Text>
                </Stack.Item>
              </Stack>
              <Stack horizontal>
                <Stack.Item>
                  <Text className={classNames.boldText}>
                    {localization.InterpretText.View.trueAnswer} &nbsp;
                  </Text>
                </Stack.Item>
                <Stack.Item>
                  <Text className={classNames.boldText}>
                    {this.props.dataSummary.trueY}
                  </Text>
                </Stack.Item>
              </Stack>
            </Stack>
          )}
        </Stack>

        <Stack tokens={componentStackTokens} horizontal>
          {this.props.isQA && (
            <Stack.Item grow>
              <Stack horizontal={false}>
                <Stack.Item>
                  <Text className={classNames.boldText}>
                    {localization.InterpretText.View.outputs}
                  </Text>
                </Stack.Item>
                <Stack.Item
                  align="stretch"
                  grow
                  disableShrink
                  className={classNames.textHighlighting}
                >
                  <TextHighlighting
                    text={this.state.text}
                    localExplanations={outputLocalExplanations}
                    topK={
                      // keep all importances for single token(set topK to length)
                      outputLocalExplanations.length
                    }
                    radio={this.state.radio}
                    isInput={false}
                    onSelectedTokenChange={this.onSelectedTokenChange}
                    selectedTokenIndex={this.state.selectedToken}
                  />
                </Stack.Item>
              </Stack>
            </Stack.Item>
          )}
          <Stack.Item grow>
            <Stack horizontal={false}>
              <Stack.Item>
                <Text className={classNames.boldText}>
                  {localization.InterpretText.View.inputs}
                </Text>
              </Stack.Item>
              <Stack.Item
                align="stretch"
                grow
                disableShrink
                className={classNames.textHighlighting}
              >
                <TextHighlighting
                  text={this.state.text}
                  localExplanations={inputLocalExplanations}
                  topK={this.state.topK}
                  radio={this.state.radio}
                  isInput={true}
                />
              </Stack.Item>
            </Stack>
          </Stack.Item>
          <Stack.Item grow className={classNames.chartRight}>
            <TextFeatureLegend
              selectedWord={this.getSelectedWord()}
              isQA={this.props.isQA}
            />
          </Stack.Item>
        </Stack>

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
    const importances = this.computeImportancesForWeightVector(
      this.props.dataSummary.localExplanations,
      weightOption
    );

    const topK = this.calculateTopKImportances(importances);
    const maxK = this.calculateMaxKImportances(importances);
    this.setState({
      importances,
      maxK,
      text: this.props.dataSummary.text,
      topK
    });
  }

  // for QA
  private updateTokenImportances(): void {
    const importances = this.computeImportancesForAllTokens(
      this.props.dataSummary.localExplanations
    );
    const topK = this.calculateTopKImportances(importances);
    const maxK = this.calculateMaxKImportances(importances);
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

  private calculateTopKImportances(importances: number[]): number {
    return Math.min(
      MaxImportantWords,
      Math.ceil(Utils.countNonzeros(importances) / 2)
    );
  }

  private calculateMaxKImportances(importances: number[]): number {
    return Math.min(
      MaxImportantWords,
      Math.ceil(Utils.countNonzeros(importances))
    );
  }

  private computeImportancesForWeightVector(
    importances: number[][],
    weightVector: WeightVectorOption
  ): number[] {
    if (weightVector === WeightVectors.AbsAvg) {
      // Sum the multidimensional array to one dimension across rows for each token
      const numClasses = importances[0].length;
      const sumImportances = importances.map((row) =>
        row.reduce((a, b): number => {
          return (a + Math.abs(b)) / numClasses;
        }, 0)
      );
      return sumImportances;
    }
    return importances.map(
      (perClassImportances) => perClassImportances[weightVector as number]
    );
  }

  private computeImportancesForAllTokens(
    importances: number[][],
    isInitialState?: boolean
  ): number[] {
    const startSumImportances = importances[0].map((_, index) =>
      importances.reduce((sum, row) => sum + row[index], 0)
    );
    const endSumImportances = importances[1].map((_, index) =>
      importances.reduce((sum, row) => sum + row[index], 0)
    );
    if (isInitialState) {
      return startSumImportances;
    }

    return this.state.qaRadio === QAExplanationType.Start
      ? startSumImportances
      : endSumImportances;
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

  private getOutputFeatureImportances(): number[][] {
    const startSumOfFeatureImportances =
      this.props.dataSummary.localExplanations[0].map((_, index) =>
        this.props.dataSummary.localExplanations[0].reduce(
          (sum, row) => sum + row[index],
          0
        )
      );
    const startOutputFeatureImportances =
      this.props.dataSummary.baseValues?.[0].map(
        (bValue, index) => startSumOfFeatureImportances[index] + bValue
      );
    const endSumOfFeatureImportances =
      this.props.dataSummary.localExplanations[1].map((_, index) =>
        this.props.dataSummary.localExplanations[1].reduce(
          (sum, row) => sum + row[index],
          0
        )
      );
    const endOutputFeatureImportances =
      this.props.dataSummary.baseValues?.[1].map(
        (bValue, index) => endSumOfFeatureImportances[index] + bValue
      );
    return [
      startOutputFeatureImportances || [],
      endOutputFeatureImportances || []
    ];
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
