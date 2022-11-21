// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  mergeStyleSets,
  IStyle,
  IProcessedStyleSet,
  getTheme
} from "@fluentui/react";

export interface IModelAssessmentDashboardStyles {
  page: IStyle;
  section: IStyle;
  buttonSection: IStyle;
  sectionHeader: IStyle;
  mainContent: IStyle;
}

export const modelAssessmentDashboardStyles: () => IProcessedStyleSet<IModelAssessmentDashboardStyles> =
  () => {
    const theme = getTheme();
    return mergeStyleSets<IModelAssessmentDashboardStyles>({
      buttonSection: {
        textAlign: "center"
      },
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
      },
      section: {
        textAlign: "left"
      },
      sectionHeader: {
        color: theme.semanticColors.bodyText,
        selectors: {
          "@media screen and (min-width: 1024px)": {
            padding: "16px 24px 16px 40px"
          }
        }
      }
    });
  };
