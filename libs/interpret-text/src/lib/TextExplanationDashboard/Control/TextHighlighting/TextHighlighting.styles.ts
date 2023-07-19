// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  IProcessedStyleSet,
  IStackStyles,
  IStyle,
  getTheme,
  mergeStyleSets,
  mergeStyles
} from "@fluentui/react";

export const textStackStyles: IStackStyles = {
  root: {
    margin: "2px",
    maxWidth: "1500px"
  }
};

export const scrollablePaneStyles: IStackStyles = {
  root: {
    height: "200px",
    position: "relative"
  }
};

export interface ITextHighlightingStyles {
  normal: IStyle;
  highlighted: IStyle;
  boldunderline: IStyle;
}

export const textHighlightingStyles: (
  isTextSelected: boolean
) => IProcessedStyleSet<ITextHighlightingStyles> = (isTextSelected) => {
  const theme = getTheme();
  const normal = {
    color: theme.semanticColors.bodyText
  };
  const selectedTextStyle = isTextSelected
    ? {
        textDecorationLine: "underline",
        textDecorationStyle: "solid",
        textDecorationThickness: "4px",
        textDecorationColor: "black"
      }
    : {};
  return mergeStyleSets<ITextHighlightingStyles>({
    boldunderline: mergeStyles([
      normal,
      {
        color: theme.semanticColors.bodyBackground,
        backgroundColor: theme.semanticColors.link,
        fontSize: theme.fonts.large.fontSize,
        margin: "2px",
        padding: 0
      },
      selectedTextStyle
    ]),
    highlighted: mergeStyles([
      normal,
      selectedTextStyle,
      {
        backgroundColor: theme.semanticColors.errorText,
        color: theme.semanticColors.bodyBackground
      }
    ]),
    normal: mergeStyles([normal, selectedTextStyle])
  });
};
