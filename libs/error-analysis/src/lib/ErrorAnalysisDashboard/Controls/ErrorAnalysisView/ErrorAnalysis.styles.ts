// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  IStyle,
  mergeStyleSets,
  IProcessedStyleSet,
  getTheme
} from "@fluentui/react";
import { flexLgDown, fullLgDown, hideLgDown } from "@responsible-ai/core-ui";

export interface IErrorAnalysisStyles {
  errorAnalysisView: IStyle;
  errorAnalysis: IStyle;
  cohortInfo: IStyle;
  featureList: IStyle;
  errorAnalysisWrapper: IStyle;
  separator: IStyle;
}

export const errorAnalysisStyles: () => IProcessedStyleSet<IErrorAnalysisStyles> =
  () => {
    const theme = getTheme();
    return mergeStyleSets<IErrorAnalysisStyles>({
      cohortInfo: {
        overflow: "auto",
        width: "40%",
        ...fullLgDown
      },
      errorAnalysisView: flexLgDown,
      errorAnalysis: {
        color: theme.semanticColors.bodyText,
        overflow: "auto",
        padding: "0 20px 20px",
        width: "100%"
      },
      errorAnalysisWrapper: { paddingLeft: "15px" },
      featureList: {
        padding: "16px 0 10px 0"
      },
      separator: hideLgDown
    });
  };
