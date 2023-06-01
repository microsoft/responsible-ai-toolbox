// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  ChoiceGroup,
  IChoiceGroupOption,
  IStackTokens,
  Label,
  Slider,
  Stack,
  Text
} from "@fluentui/react";
//import { WeightVectorOption, WeightVectors } from "@responsible-ai/core-ui";
import { WeightVectors } from "@responsible-ai/core-ui";
import { TokenImportance } from "@responsible-ai/interpret";
import { localization } from "@responsible-ai/localization";
import React from "react";

import { RadioKeys, Utils } from "../../CommonUtils";
import { ITextExplanationViewProps } from "../../Interfaces/IExplanationViewProps";
import { BarChart } from "../BarChart/BarChart";
import { TextFeatureLegend } from "../TextFeatureLegend/TextFeatureLegend";
import { TextHighlighting } from "../TextHighlighting/TextHightlighting";

import { textExplanationDashboardStyles } from "./TextExplanationView.styles";

export interface ITextExplanationViewState {
  /*
   * Holds the state of the dashboard
   */
  maxK: number;
  topK: number;
  radio: string;
  qaRadio?: string;
  importances: number[];
  singleTokenImportances: number[];
  selectedToken: number;
  tokenIndexes: number[];
  text: string[];
}

const options: IChoiceGroupOption[] = [
  /*
   * Creates the choices for the radio button
   */
  { key: RadioKeys.All, text: localization.InterpretText.View.allButton },
  { key: RadioKeys.Pos, text: localization.InterpretText.View.posButton },
  { key: RadioKeys.Neg, text: localization.InterpretText.View.negButton }
];

const qaOptions: IChoiceGroupOption[] = [
  /*
   * Creates the choices for the QA prediction radio button(local testing)
   * TODO: move keys to CommonUtils, and text to localization.InterpretText.View.*
   */
  { key: "starting", text: "STARTING POSITION" },
  { key: "ending", text: "ENDING POSITION" },
];

const componentStackTokens: IStackTokens = {
  childrenGap: "m",
  padding: "m"
};

const MaxImportantWords = 15;

export class TextExplanationView extends React.PureComponent<
  ITextExplanationViewProps,
  ITextExplanationViewState
> {
  public constructor(props: ITextExplanationViewProps) {
    /*
     * Initializes the text view with its state
     */
    super(props);
    
    const importances = this.computeImportancesForAllTokens(
      this.props.dataSummary.localExplanations,
    );
    
    const selectedToken = 0; // default to the first token
    const singleTokenImportances = this.getImportanceForSingleToken(selectedToken);
    const maxK = this.calculateMaxKImportances(importances);
    const topK = this.calculateTopKImportances(importances);
    this.state = {
      importances: importances,
      singleTokenImportances: singleTokenImportances,
      selectedToken: selectedToken,
      tokenIndexes: Array.from(this.props.dataSummary.text, (_, index) => index),
      maxK,
      radio: RadioKeys.All,
      qaRadio: "starting",
      text: this.props.dataSummary.text,
      topK
    };
  }

  public componentDidUpdate(prevProps: ITextExplanationViewProps): void {
    if (
      this.props.dataSummary.text !== prevProps.dataSummary.text ||
      this.props.dataSummary.localExplanations !==
        prevProps.dataSummary.localExplanations
    ) {
      // TODO: this should be conditionally disabled (when we're explaining QA)
      //this.updateImportances(this.props.selectedWeightVector);

      this.setState({  //update token dropdown
        tokenIndexes: Array.from(this.props.dataSummary.text, (_, index) => index),
        selectedToken: 0
      },
      () => {
        this.updateTokenImportances();
        this.updateSingleTokenImportances();
      })
    }
  }

  public render(): React.ReactNode {
    const classNames = textExplanationDashboardStyles();
    return (
      <Stack>
        <Stack tokens={componentStackTokens} horizontal>
          <Text>{localization.InterpretText.View.legendText}</Text>
        </Stack>
        <Stack tokens={componentStackTokens} horizontal>
          <Stack.Item grow disableShrink>
            <BarChart
              text={this.state.text}
              localExplanations={this.state.importances}
              topK={this.state.topK}
              radio={this.state.radio}
            />
          </Stack.Item>
          <Stack.Item grow className={classNames.chartRight}>
            <Stack tokens={componentStackTokens}>
              
              {/* TODO: this item should be conditionally disabled (when we're explaining QA)
              <Stack.Item>
                <Text variant={"xLarge"}>
                  {localization.InterpretText.View.label +
                    localization.InterpretText.View.colon +
                    Utils.predictClass(
                      this.props.dataSummary.classNames,
                      this.props.dataSummary.prediction
                    )}
                </Text>
              </Stack.Item>
              */}

              {/* TODO: this should be conditionally enabled (when we're explaining QA)*/}
              <Stack.Item id="TextChoiceGroup">
                  <ChoiceGroup
                    defaultSelectedKey="starting"
                    options={qaOptions}
                    onChange={this.switchQAprediction}
                    required
                  />
              </Stack.Item>

              <Stack.Item>
                <Label>{localization.InterpretText.View.importantWords}</Label>
              </Stack.Item>

              <Stack.Item id="TextTopKSlider">
                <Slider
                  min={1}
                  max={this.state.maxK}
                  step={1}
                  value={this.state.topK}
                  showValue
                  onChange={this.setTopK}
                />
              </Stack.Item>

              {/* TODO: this should be conditionally disabled (when we're explaining QA)
              <Stack.Item>
                <ClassImportanceWeights
                  onWeightChange={this.onWeightVectorChange}
                  selectedWeightVector={this.props.selectedWeightVector}
                  weightOptions={this.props.weightOptions}
                  weightLabels={this.props.weightLabels}
                />
              </Stack.Item>
              */}

              <Stack.Item>
                <TokenImportance
                  onTokenChange={this.onSelectedTokenChange}
                  selectedToken={this.state.selectedToken}
                  tokenOptions={this.state.tokenIndexes}
                  tokenLabels={this.state.text}
                />
              </Stack.Item>

              {this.props.selectedWeightVector !== WeightVectors.AbsAvg && (
                <Stack.Item id="TextChoiceGroup">
                  <ChoiceGroup
                    defaultSelectedKey="all"
                    options={options}
                    onChange={this.changeRadioButton}
                    required
                  />
                </Stack.Item>
              )}
            </Stack>
          </Stack.Item>
        </Stack>

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
          <Stack.Item align="end">
          </Stack.Item>

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
          <Stack.Item align="end">
            <TextFeatureLegend />
          </Stack.Item>
        </Stack>
        
      </Stack>
    );
  }

  /* TODO: move the func back when conditional rendering is ready (commented for passing build)
  private onWeightVectorChange = (weightOption: WeightVectorOption): void => {
    this.updateImportances(weightOption);
    this.props.onWeightChange(weightOption);
  };
  */

  private onSelectedTokenChange = (newIndex: number): void => {

    this.setState(
      { selectedToken: newIndex },
      () => {
        this.updateSingleTokenImportances();
      });
  };

  /* TODO: move the func back when conditional rendering is ready (commented for passing build)
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
  */

  // for QA
  private updateTokenImportances(): void {

    const importances = this.computeImportancesForAllTokens(
        this.props.dataSummary.localExplanations,
      );
    const topK = this.calculateTopKImportances(importances);
    const maxK = this.calculateMaxKImportances(importances);
    this.setState({
      importances,
      maxK,
      topK,
      text: this.props.dataSummary.text
    });
  }

  private updateSingleTokenImportances(): void {
    const singleTokenImportances = this.getImportanceForSingleToken(this.state.selectedToken);
    this.setState({singleTokenImportances: singleTokenImportances});
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

  /* TODO: move the func back when conditional rendering is ready (commented for passing build)
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
  */

  private computeImportancesForAllTokens(
    importances: number[][]
  ): number[] {
    /*
     * sum the tokens importance
     * TODO: add base values
     */
    const sumImportances = importances.map((row) =>
        row.reduce((a, b): number => {
          return (a + b);
        }, 0)
    );
    return sumImportances;
  }

  private getImportanceForSingleToken(
    index: number
  ): number[] {
    return this.props.dataSummary.localExplanations.map(row => row[index]);
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

  // TODO: add logic for switching explanation data 
  private switchQAprediction = (
    _event?: React.FormEvent,
    item?: IChoiceGroupOption
  ): void => {
    /*
     * switch to the target predictions(starting or ending)
     */
    if (item?.key !== undefined) {
      this.setState({ qaRadio: item.key });
    }
  };

}
