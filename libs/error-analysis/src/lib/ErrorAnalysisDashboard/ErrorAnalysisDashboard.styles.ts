// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  IStyle,
  mergeStyleSets,
  IProcessedStyleSet,
  getTheme
} from "office-ui-fabric-react";

export interface IErrorAnalysisDashboardStyles {
  pivotLabelWrapper: IStyle;
  page: IStyle;
}

export const ErrorAnalysisDashboardStyles: () => IProcessedStyleSet<
  IErrorAnalysisDashboardStyles
> = () => {
  const theme = getTheme();
  return mergeStyleSets<IErrorAnalysisDashboardStyles>({
    page: {
      backgroundColor: theme.semanticColors.bodyBackground,
      color: theme.semanticColors.bodyText,
      maxHeight: "1000px"
    },
    pivotLabelWrapper: {
      display: "flex",
      flexDirection: "row",
      justifyContent: "space-between",
      padding: "10px 30px"
    }
  });
};
