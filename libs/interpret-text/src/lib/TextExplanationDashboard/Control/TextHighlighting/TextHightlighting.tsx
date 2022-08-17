// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Label, Text, Stack, IStackTokens } from "@fluentui/react";
import React from "react";

import { Utils } from "../../CommonUtils";
import { IChartProps } from "../../Interfaces/IChartProps";

import {
  textHighlightingStyles,
  textStackStyles
} from "./TextHighlighting.styles";

const textStackTokens: IStackTokens = {
  childrenGap: "s2",
  padding: "s2"
};

export class TextHighlighting extends React.PureComponent<IChartProps> {
  /*
   * Presents the document in an accessible manner with text highlighting
   */
  public render(): React.ReactNode {
    const classNames = textHighlightingStyles();
    const text = this.props.text;
    const importances = this.props.localExplanations;
    const k = this.props.topK;
    const sortedList = Utils.sortedTopK(importances, k!, this.props.radio!);
    return (
      <Stack
        id="TextHighlighting"
        horizontal
        horizontalAlign="start"
        tokens={textStackTokens}
        wrap
        styles={textStackStyles}
      >
        {text.map((word, wordIndex) => {
          let styleType = classNames.normal;
          const score = importances[wordIndex];
          let isBold = false;
          if (sortedList.includes(wordIndex)) {
            if (score > 0) {
              styleType = classNames.highlighted;
            } else if (score < 0) {
              styleType = classNames.boldunderline;
              isBold = true;
            } else {
              styleType = classNames.normal;
            }
          }
          if (isBold) {
            return (
              <Label
                key={wordIndex}
                className={styleType}
                title={score.toString()}
              >
                {word}
              </Label>
            );
          }

          return (
            <Text
              variant={"large"}
              key={wordIndex}
              className={styleType}
              title={score.toString()}
            >
              {word}
            </Text>
          );
        })}
      </Stack>
    );
  }
}
