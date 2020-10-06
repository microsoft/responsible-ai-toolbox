// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from "react";

import { localization } from "../../Localization/localization";
import { IHelpMessage } from "../Interfaces/IStringsParam";

import { noDataMessageStyles } from "./NoDataMessage.styles";

export class NoDataMessage extends React.PureComponent<{
  explanationStrings?: IHelpMessage[];
}> {
  public render(): React.ReactNode {
    return (
      <div className={noDataMessageStyles.centered}>
        <div className={noDataMessageStyles.primaryMessage}>
          {localization.BarChart.noData}
        </div>
        {this.renderExplanationStrings()}
      </div>
    );
  }

  private renderExplanationStrings(): React.ReactNode {
    // Support links et c. when needed.
    if (
      this.props.explanationStrings === undefined ||
      this.props.explanationStrings.length === 0
    ) {
      return;
    }
    const children = this.props.explanationStrings.map((message, index) => {
      return <span key={index}>{message.displayText}</span>;
    });
    return (
      <div className={noDataMessageStyles.secondaryMessage}>{children}</div>
    );
  }
}
