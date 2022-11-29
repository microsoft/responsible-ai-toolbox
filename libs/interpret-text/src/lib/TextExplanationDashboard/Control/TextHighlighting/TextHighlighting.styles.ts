// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  IStyle,
  mergeStyles,
  mergeStyleSets,
  IProcessedStyleSet,
  IStackStyles,
  getTheme
} from "@fluentui/react";
import { getPrimaryChartColor } from "@responsible-ai/core-ui";

export const textStackStyles: IStackStyles = {
  root: {
    maxWidth: "1500px"
  }
};

export interface ITextHighlightingStyles {
  normal: IStyle;
  highlighted: IStyle;
  boldunderline: IStyle;
}

export const textHighlightingStyles: () => IProcessedStyleSet<ITextHighlightingStyles> =
  () => {
    const theme = getTheme();
    const normal = {
      color: theme.semanticColors.bodyText
    };
    return mergeStyleSets<ITextHighlightingStyles>({
      boldunderline: mergeStyles([
        normal,
        {
          color: getPrimaryChartColor(theme),
          fontSize: theme.fonts.large.fontSize,
          margin: "2px",
          padding: 0,
          textDecorationLine: "underline"
        }
      ]),
      highlighted: mergeStyles([
        normal,
        {
          backgroundColor: getPrimaryChartColor(theme),
          color: theme.semanticColors.bodyBackground
        }
      ]),
      normal
    });
  };
