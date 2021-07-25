// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  mergeStyleSets,
  IStyle,
  getTheme,
  IProcessedStyleSet
} from "office-ui-fabric-react";

export interface IAddTabButtonStyles {
  callout: IStyle;
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
            fontSize: "32px"
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
      splitter: {
        backgroundColor: theme.semanticColors.variantBorder,
        height: 1,
        position: "relative",
        top: 16
      }
    });
  };
