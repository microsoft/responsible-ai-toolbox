// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  IStyle,
  mergeStyleSets,
  IProcessedStyleSet,
  getTheme
} from "@fluentui/react";

export interface ITextExplanationDashboardStyles {
  chartRight: IStyle;
  textHighlighting: IStyle;
  predictedAnswer: IStyle;
  boldText: IStyle;
}

export const textExplanationDashboardStyles: () => IProcessedStyleSet<ITextExplanationDashboardStyles> =
  () => {
    const theme = getTheme();
    return mergeStyleSets<ITextExplanationDashboardStyles>({
      boldText: {
        fontWeight: "bold"
      },
      chartRight: {
        maxWidth: "230px",
        minWidth: "230px"
      },
      predictedAnswer: {
        fontWeight: "bold",
        paddingBottom: "14px"
      },
      textHighlighting: {
        borderColor: theme.semanticColors.variantBorder,
        borderRadius: "1px",
        borderStyle: "groove",
        lineHeight: "32px",
        maxHeight: "200px",
        minWidth: "400px",
        padding: "25px"
      }
    });
  };
