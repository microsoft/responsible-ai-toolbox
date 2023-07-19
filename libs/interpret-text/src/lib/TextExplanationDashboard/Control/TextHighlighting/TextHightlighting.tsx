// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  Text,
  Stack,
  IStackTokens,
  ScrollablePane,
  ScrollbarVisibility
} from "@fluentui/react";
import React from "react";

import { Utils } from "../../CommonUtils";
import { IChartProps } from "../../Interfaces/IChartProps";

import {
  textHighlightingStyles,
  textStackStyles,
  scrollablePaneStyles
} from "./TextHighlighting.styles";

const textStackTokens: IStackTokens = {
  childrenGap: "s2",
  padding: "s2"
};

export class TextHighlighting extends React.Component<IChartProps> {
  /*
   * Presents the document in an accessible manner with text highlighting
   */
  public render(): React.ReactNode {
    const text = this.props.text;
    console.log("!!text: ", text, this.props.isInput);
    const importances = this.props.localExplanations;
    console.log("!!importances: ", importances);
    const k = this.props.topK;
    const sortedList = Utils.sortedTopK(importances, k, this.props.radio);
    console.log("!!sortedList: ", sortedList, text.length, importances.length);
    return (
      <Stack styles={scrollablePaneStyles}>
        <ScrollablePane scrollbarVisibility={ScrollbarVisibility.auto}>
          <Stack
            id="TextHighlighting"
            horizontal
            horizontalAlign="start"
            tokens={textStackTokens}
            wrap
            styles={textStackStyles}
          >
            {text.map((word, wordIndex) => {
              const isWordSelected =
                (this.props.selectedTokenIndex &&
                  wordIndex === this.props.selectedTokenIndex) ||
                false;
              const classNames = textHighlightingStyles(isWordSelected);
              let styleType = classNames.normal;
              const score = importances[wordIndex];
              console.log("!!word: ", wordIndex, word, score);
              // let isBold = false;
              if (sortedList.includes(wordIndex)) {
                if (score > 0) {
                  styleType = classNames.highlighted;
                } else if (score < 0) {
                  styleType = classNames.boldunderline;
                  // isBold = true;
                } else {
                  styleType = classNames.normal;
                }
              }
              // if (isBold) {
              //   return (
              //     <Label
              //       key={wordIndex}
              //       className={styleType}
              //       title={score.toString()}
              //     >
              //       {word}
              //     </Label>
              //   );
              // }
              // if (word === "[SEP]") {
              //   return (
              //     <Text
              //       variant={"large"}
              //       key={wordIndex}
              //       className={styleType}
              //       title={score.toString()}
              //       styles={{ root: { whiteSpace: "pre-line" } }}
              //     >
              //       {word}
              //     </Text>
              //   );
              // }

              return (
                <Text
                  variant={"large"}
                  key={wordIndex}
                  className={styleType}
                  title={score.toString()}
                  onClick={() => this.handleClick(wordIndex)}
                >
                  {word}
                </Text>
              );
            })}
          </Stack>
        </ScrollablePane>
      </Stack>
    );
  }

  private readonly handleClick = (wordIndex: number) => {
    if (this.props.isInput) {
      return;
    }
    if (this.props.onSelectedTokenChange) {
      this.props.onSelectedTokenChange(wordIndex);
    }
  };
}
