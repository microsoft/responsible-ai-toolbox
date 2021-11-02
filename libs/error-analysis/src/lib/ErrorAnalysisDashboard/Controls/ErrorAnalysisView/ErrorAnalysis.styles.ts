// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  IStyle,
  mergeStyleSets,
  IProcessedStyleSet,
  getTheme
} from "office-ui-fabric-react";

export interface IErrorAnalysisStyles {
  errorAnalysis: IStyle;
  cohortInfo: IStyle;
}

export const errorAnalysisStyles: () => IProcessedStyleSet<IErrorAnalysisStyles> =
  () => {
    const theme = getTheme();
    return mergeStyleSets<IErrorAnalysisStyles>({
      cohortInfo: {
        overflow: "auto",
        width: "40%"
      },
      errorAnalysis: {
        color: theme.semanticColors.bodyText,
        overflow: "auto",
        width: "100%"
      }
    });
  };
