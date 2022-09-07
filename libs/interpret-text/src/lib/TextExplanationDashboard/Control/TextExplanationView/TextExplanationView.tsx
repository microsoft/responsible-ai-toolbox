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
import { WeightVectorOption, WeightVectors } from "@responsible-ai/core-ui";
import { ClassImportanceWeights } from "@responsible-ai/interpret";
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
  importances: number[];
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

const componentStackTokens: IStackTokens = {
  childrenGap: "m",
  padding: "m"
};

export class TextExplanationView extends React.PureComponent<
  ITextExplanationViewProps,
  ITextExplanationViewState
> {
  constructor(props: ITextExplanationViewProps) {
    /*
     * Initializes the text view with its state
     */
    super(props);
    const weightVector = this.props.selectedWeightVector;
    const importances = this.computeImportancesForWeightVector(
      this.props.dataSummary.localExplanations,
      weightVector
    );
    this.state = {
      importances,
      maxK: Math.min(15, Math.ceil(Utils.countNonzeros(importances))),
      radio: RadioKeys.All,
      text: this.props.dataSummary.text,
      topK: Math.ceil(Utils.countNonzeros(importances) / 2)
    };
  }

  public componentDidUpdate(prevProps: ITextExplanationViewProps): void {
    if (
      this.props.dataSummary.text !== prevProps.dataSummary.text ||
      this.props.dataSummary.localExplanations !==
        prevProps.dataSummary.localExplanations
    ) {
      this.updateImportances(this.props.selectedWeightVector);
    }
  }

  public render() {
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
              <Stack.Item>
                <Text variant={"xLarge"}>
                  {localization.InterpretText.View.label +
                    localization.InterpretText.View.colon +
                    Utils.predictClass(
                      this.props.dataSummary.classNames!,
                      this.props.dataSummary.prediction!
                    )}
                </Text>
              </Stack.Item>
              <Stack.Item>
                <Label>{localization.InterpretText.View.importantWords}</Label>
              </Stack.Item>
              <Stack.Item id="TextTopKSlider">
                <Slider
                  min={1}
                  max={this.state.maxK}
                  step={1}
                  defaultValue={this.state.topK}
                  showValue
                  onChange={this.setTopK}
                />
              </Stack.Item>
              <Stack.Item>
                <ClassImportanceWeights
                  onWeightChange={this.onWeightVectorChange}
                  selectedWeightVector={this.props.selectedWeightVector}
                  weightOptions={this.props.weightOptions}
                  weightLabels={this.props.weightLabels}
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

  private updateImportances(weightOption: WeightVectorOption): void {
    const importances = this.computeImportancesForWeightVector(
      this.props.dataSummary.localExplanations,
      weightOption
    );
    this.setState({ importances, text: this.props.dataSummary.text });
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
}
