// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  IStyle,
  mergeStyleSets,
  IProcessedStyleSet,
  getTheme
} from "@fluentui/react";
import { descriptionMaxWidth } from "@responsible-ai/core-ui";

export interface IModelPerformanceTabStyles {
  page: IStyle;
  infoWithText: IStyle;
}

export const modelPerformanceTabStyles: () => IProcessedStyleSet<IModelPerformanceTabStyles> =
  () => {
    const theme = getTheme();
    return mergeStyleSets<IModelPerformanceTabStyles>({
      infoWithText: {
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "row",
        maxWidth: descriptionMaxWidth,
        paddingLeft: "25px",
        width: "100%"
      },
      page: {
        boxSizing: "border-box",
        color: theme.semanticColors.bodyText,
        display: "flex",
        flexDirection: "column",
        height: "100%",
        padding: "16px 40px 0 14px",
        width: "100%"
      }
    });
  };
