// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  IStyle,
  mergeStyleSets,
  IProcessedStyleSet
} from "office-ui-fabric-react";

export interface IErrorAnalysisStyles {
  errorAnalysis: IStyle;
  cohortInfo: IStyle;
}

export const errorAnalysisStyles: () => IProcessedStyleSet<IErrorAnalysisStyles> =
  () => {
    return mergeStyleSets<IErrorAnalysisStyles>({
      cohortInfo: {
        overflow: "auto",
        width: "40%"
      },
      errorAnalysis: {
        overflow: "auto",
        width: "100%"
      }
    });
  };
