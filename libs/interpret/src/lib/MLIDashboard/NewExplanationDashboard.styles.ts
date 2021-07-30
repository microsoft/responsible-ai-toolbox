// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  IStyle,
  mergeStyleSets,
  IProcessedStyleSet,
  getTheme
} from "office-ui-fabric-react";

export interface IExplanationDashboardStyles {
  page: IStyle;
}

export const explanationDashboardStyles: () => IProcessedStyleSet<IExplanationDashboardStyles> =
  () => {
    const theme = getTheme();
    return mergeStyleSets<IExplanationDashboardStyles>({
      page: {
        backgroundColor: theme.semanticColors.bodyBackground,
        color: theme.semanticColors.bodyText,
        maxHeight: "1000px"
      }
    });
  };
