// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  IStyle,
  mergeStyleSets,
  IProcessedStyleSet,
  getTheme
} from "@fluentui/react";

export interface IDataAnalysisTabStyles {
  container: IStyle;
  pivotLabelWrapper: IStyle;
}

export const dataAnalysisTabStyles: () => IProcessedStyleSet<IDataAnalysisTabStyles> =
  () => {
    const theme = getTheme();
    return mergeStyleSets<IDataAnalysisTabStyles>({
      container: {
        color: theme.semanticColors.bodyText
      },
      pivotLabelWrapper: {
        display: "flex",
        flexDirection: "row",
        justifyContent: "start",
        padding: "0px 30px 15px"
      }
    });
  };
