// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  ChoiceGroup,
  IChoiceGroupOption,
  Label,
  Slider,
  Stack,
  Text
} from "@fluentui/react";
import { WeightVectorOption, WeightVectors } from "@responsible-ai/core-ui";
import { ClassImportanceWeights } from "@responsible-ai/interpret";
import { localization } from "@responsible-ai/localization";
import React from "react";

import { QAExplanationType, Utils } from "../../CommonUtils";
import { IDatasetSummary } from "../../Interfaces/IExplanationDashboardProps";
import { BarChart } from "../BarChart/BarChart";

import {
  componentStackTokens,
  options,
  qaOptions
} from "./ITextExplanationViewSpec";
import { textExplanationDashboardStyles } from "./TextExplanationView.styles";

export interface ISidePanelOfChartProps {
  text: string[];
  importances: number[];
  topK: number;
  radio: string;
  isQA?: boolean;
  dataSummary: IDatasetSummary;
  maxK: number;
  selectedToken: number;
  tokenIndexes: number[];
  selectedWeightVector: WeightVectorOption;
  weightOptions: WeightVectorOption[];
  weightLabels: any;
  changeRadioButton: (
    _event?: React.FormEvent,
    item?: IChoiceGroupOption
  ) => void;
  switchQAPrediction: (
    _event?: React.FormEvent,
    _item?: IChoiceGroupOption
  ) => void;
  setTopK: (newNumber: number) => void;
  onWeightVectorChange: (weightOption: WeightVectorOption) => void;
  onSelectedTokenChange: (newIndex: number) => void;
}

export class SidePanelOfChart extends React.PureComponent<ISidePanelOfChartProps> {
  public render(): React.ReactNode {
    const classNames = textExplanationDashboardStyles();

    return (
      <Stack tokens={componentStackTokens} horizontal>
        <Stack.Item grow disableShrink>
          <BarChart
            text={this.props.text}
            localExplanations={this.props.importances}
            topK={this.props.topK}
            radio={this.props.radio}
          />
        </Stack.Item>
        <Stack.Item grow className={classNames.chartRight}>
          <Stack tokens={componentStackTokens}>
            {!this.props.isQA && ( // classification
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
            )}

            {this.props.isQA && ( // select starting/ending for QA
              <Stack.Item id="TextChoiceGroup">
                <ChoiceGroup
                  defaultSelectedKey={QAExplanationType.Start}
                  options={qaOptions}
                  onChange={this.props.switchQAPrediction}
                  required
                />
              </Stack.Item>
            )}

            <Stack.Item>
              <Label>{localization.InterpretText.View.importantWords}</Label>
            </Stack.Item>

            <Stack.Item id="TextTopKSlider">
              <Slider
                min={1}
                max={this.props.maxK}
                step={1}
                value={this.props.topK}
                showValue
                onChange={this.props.setTopK}
              />
            </Stack.Item>
            {!this.props.isQA && (
              <Stack.Item>
                <ClassImportanceWeights
                  onWeightChange={this.props.onWeightVectorChange}
                  selectedWeightVector={this.props.selectedWeightVector}
                  weightOptions={this.props.weightOptions}
                  weightLabels={this.props.weightLabels}
                />
              </Stack.Item>
            )}

            {this.props.selectedWeightVector !== WeightVectors.AbsAvg && (
              <Stack.Item id="TextChoiceGroup">
                <ChoiceGroup
                  defaultSelectedKey="all"
                  options={options}
                  onChange={this.props.changeRadioButton}
                  required
                />
              </Stack.Item>
            )}
          </Stack>
        </Stack.Item>
      </Stack>
    );
  }
}
