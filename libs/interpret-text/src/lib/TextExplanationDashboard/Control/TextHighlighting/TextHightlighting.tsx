// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from "react";

import { Utils } from "../../CommonUtils";
import { IChartProps } from "../../Interfaces/IChartProps";

import { textHighlightingStyles } from "./TextHighlighting.styles";

export class TextHighlighting extends React.PureComponent<IChartProps> {
  /*
   * presents the document in an accessible manner with text highlighting
   */
  public render(): React.ReactNode[] {
    const classNames = textHighlightingStyles();
    const text = this.props.text;
    const importances = this.props.localExplanations;
    const k = this.props.topK;
    const sortedList = Utils.sortedTopK(importances, k!, this.props.radio!);
    const val = text.map((word, wordIndex) => {
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
        <span key={wordIndex} className={styleType} title={score.toString()}>
          {word}
        </span>
      );
    });
    return val.map((word, wordIndex) => {
      return <span key={wordIndex}>{word} </span>;
    });
  }
}
