// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Stack, Text } from "@fluentui/react";
import { localization } from "@responsible-ai/localization";
import React from "react";

import { TextFeatureLegend } from "../TextFeatureLegend/TextFeatureLegend";
import { TextHighlighting } from "../TextHighlighting/TextHightlighting";

import { componentStackTokens } from "./ITextExplanationViewSpec";
import { textExplanationDashboardStyles } from "./TextExplanationView.styles";

interface ITextInputOutputAreaWithLegendProps {
  topK: number;
  radio: string;
  selectedToken: number;
  text: string[];
  outputLocalExplanations: number[];
  inputLocalExplanations: number[];
  isQA?: boolean;
  getSelectedWord: () => string;
  onSelectedTokenChange: (newIndex: number) => void;
}

export class TextInputOutputAreaWithLegend extends React.Component<ITextInputOutputAreaWithLegendProps> {
  public render(): React.ReactNode {
    const classNames = textExplanationDashboardStyles();

    return (
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
                  text={this.props.text}
                  localExplanations={this.props.outputLocalExplanations}
                  topK={
                    // keep all importances for single token(set topK to length)
                    this.props.outputLocalExplanations.length
                  }
                  radio={this.props.radio}
                  isInput={false}
                  onSelectedTokenChange={this.props.onSelectedTokenChange}
                  selectedTokenIndex={this.props.selectedToken}
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
                text={this.props.text}
                localExplanations={this.props.inputLocalExplanations}
                topK={this.props.topK}
                radio={this.props.radio}
                isInput
              />
            </Stack.Item>
          </Stack>
        </Stack.Item>
        <Stack.Item grow className={classNames.chartRight}>
          <TextFeatureLegend
            selectedWord={this.props.getSelectedWord()}
            isQA={this.props.isQA}
          />
        </Stack.Item>
      </Stack>
    );
  }
}
