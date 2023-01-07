// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { mergeStyleSets, IStyle, IProcessedStyleSet } from "@fluentui/react";

export interface IModelAssessmentDashboardStyles {
  page: IStyle;
  mainContent: IStyle;
}

export const modelAssessmentDashboardStyles: () => IProcessedStyleSet<IModelAssessmentDashboardStyles> =
  () => {
    return mergeStyleSets<IModelAssessmentDashboardStyles>({
      mainContent: {
        height: "100%",
        overflowY: "scroll",
        position: "relative"
      },
      page: {
        boxSizing: "border-box",
        height: "100%",
        selectors: {
          "@media screen and (min-width: 1024px)": {
            padding: "16px 14px 0 14px"
          }
        },
        width: "100%"
      }
    });
  };
