// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  mergeStyleSets,
  IStyle,
  getTheme,
  IProcessedStyleSet
} from "@fluentui/react";

export interface IAddTabButtonStyles {
  callout: IStyle;
  calloutContent: IStyle;
  button: IStyle;
  splitter: IStyle;
  buttonSection: IStyle;
}

export const addTabButtonStyles =
  (): IProcessedStyleSet<IAddTabButtonStyles> => {
    const theme = getTheme();
    return mergeStyleSets<IAddTabButtonStyles>({
      button: {
        backgroundColor: theme.semanticColors.bodyBackground,
        span: {
          i: {
            fontSize: "32px",
            letterSpacing: "0px !important;",
            lineHeight: "10px !important;",
            marginBottom: "-8px !important;",
            wordSpacing: "0px !important;"
          }
        }
      },
      buttonSection: {
        padding: "10px 0 10px 0"
      },
      callout: {
        padding: "1em",
        width: "15em"
      },
      calloutContent: {
        padding: "2px"
      },
      splitter: {
        backgroundColor: theme.semanticColors.variantBorder,
        height: 1,
        position: "relative",
        top: 16
      }
    });
  };
