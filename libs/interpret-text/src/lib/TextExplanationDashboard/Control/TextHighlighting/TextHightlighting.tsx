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
    const importances = this.props.localExplanations;
    const k = this.props.topK;
    const sortedList = Utils.sortedTopK(importances, k, this.props.radio);
    return (
      <Stack styles={scrollablePaneStyles}>
        <ScrollablePane
          scrollbarVisibility={ScrollbarVisibility.auto}
          scrollContainerFocus
        >
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
              if (sortedList.includes(wordIndex)) {
                if (score > 0) {
                  styleType = classNames.highlighted;
                } else if (score < 0) {
                  styleType = classNames.boldunderline;
                } else {
                  styleType = classNames.normal;
                }
              }

              return (
                <Text
                  variant={"large"}
                  key={wordIndex}
                  className={styleType}
                  title={score.toString()}
                  onClick={(): void => this.handleClick(wordIndex)}
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

  private readonly handleClick = (wordIndex: number): void => {
    if (this.props.isInput) {
      return;
    }
    if (this.props.onSelectedTokenChange) {
      this.props.onSelectedTokenChange(wordIndex);
    }
  };
}
