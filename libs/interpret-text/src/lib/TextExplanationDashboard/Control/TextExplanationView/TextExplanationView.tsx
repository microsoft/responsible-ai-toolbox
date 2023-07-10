// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IChoiceGroupOption, Stack, Text } from "@fluentui/react";
import { WeightVectorOption, WeightVectors } from "@responsible-ai/core-ui";
import { localization } from "@responsible-ai/localization";
import React from "react";

import { RadioKeys, Utils } from "../../CommonUtils";
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

export class TextExplanationView extends React.PureComponent<
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
          this.props.dataSummary.localExplanations
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
      // qaRadio: QAExplanationType.Start,
      radio: RadioKeys.All,
      selectedToken: 0, // default to the first token
      singleTokenImportances: this.getImportanceForSingleToken(0), // get importance for first token
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
            //update token dropdown
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

    return (
      <Stack>
        <Stack tokens={componentStackTokens} horizontal>
          {this.props.isQA ? (
            <Text>{localization.InterpretText.View.legendTextForQA}</Text>
          ) : (
            <Text>{localization.InterpretText.View.legendText}</Text>
          )}
        </Stack>

        <SidePanelOfChart
          text={this.state.text}
          importances={this.state.importances}
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
        />

        <Stack tokens={componentStackTokens} horizontal>
          <Stack.Item
            align="stretch"
            grow
            disableShrink
            className={classNames.textHighlighting}
          >
            <TextHighlighting
              text={this.state.text}
              localExplanations={this.state.importances}
              topK={this.state.topK}
              radio={this.state.radio}
            />
          </Stack.Item>

          {this.props.isQA && (
            <Stack.Item
              align="stretch"
              grow
              disableShrink
              className={classNames.textHighlighting}
            >
              <TextHighlighting
                text={this.state.text}
                localExplanations={this.state.singleTokenImportances}
                topK={
                  // keep all importances for single token(set topK to length)
                  this.state.singleTokenImportances.length
                }
                radio={this.state.radio}
              />
            </Stack.Item>
          )}

          <Stack.Item align="end">
            <TextFeatureLegend />
          </Stack.Item>
        </Stack>
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

  private computeImportancesForAllTokens(importances: number[][]): number[] {
    /*
     * sum the tokens importance
     * TODO: add base values?
     */

    const sumImportances = importances[0].map((_, index) =>
      importances.reduce((sum, row) => sum + row[index], 0)
    );

    return sumImportances;
  }

  private getImportanceForSingleToken(index: number): number[] {
    return this.props.dataSummary.localExplanations.map((row) => row[index]);
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

  private switchQAPrediction = (): // _event?: React.FormEvent,
  // _item?: IChoiceGroupOption
  void => {
    /*
     * switch to the target predictions(starting or ending)
     * TODO: add logic for switching explanation data
     */
    // if (item?.key !== undefined) {
    //   this.setState({ qaRadio: item.key });
    // }
  };
}
