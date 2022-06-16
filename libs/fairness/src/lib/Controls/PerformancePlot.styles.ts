// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  getTheme,
  IProcessedStyleSet,
  IStyle,
  mergeStyleSets
} from "@fluentui/react";

export interface IPerformancePlotStyles {
  legendPanel: IStyle;
  legendTitle: IStyle;
  legendSubtitle: IStyle;
}

export const PerformancePlotStyles: () => IProcessedStyleSet<IPerformancePlotStyles> =
  () => {
    const theme = getTheme();
    return mergeStyleSets<IPerformancePlotStyles>({
      legendPanel: {
        marginLeft: "100px"
      },
      legendSubtitle: {
        color: theme.semanticColors.bodySubtext,
        fontSize: "9px",
        fontStyle: "italic",
        lineHeight: "12x"
      },
      legendTitle: {
        color: theme.semanticColors.bodyText,
        fontSize: "12px",
        lineHeight: "16px"
      }
    });
  };
