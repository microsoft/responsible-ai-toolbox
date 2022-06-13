// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  IStyle,
  mergeStyleSets,
  IProcessedStyleSet,
  getTheme
} from "@fluentui/react";

export interface IErrorAnalysisDashboardStyles {
  pivotLabelWrapper: IStyle;
  page: IStyle;
}

export const ErrorAnalysisDashboardStyles: () => IProcessedStyleSet<IErrorAnalysisDashboardStyles> =
  () => {
    const theme = getTheme();
    return mergeStyleSets<IErrorAnalysisDashboardStyles>({
      page: {
        backgroundColor: theme.semanticColors.bodyBackground,
        borderBottom: "1px solid #C8C8C8",
        borderLeft: "1px solid #C8C8C8",
        borderRight: "1px solid #C8C8C8",
        color: theme.semanticColors.bodyText,
        maxHeight: "1200px"
      },
      pivotLabelWrapper: {
        display: "flex",
        flexDirection: "row",
        justifyContent: "start",
        padding: "0px 30px"
      }
    });
  };
