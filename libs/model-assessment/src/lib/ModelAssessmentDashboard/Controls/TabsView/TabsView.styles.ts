// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  IStyle,
  mergeStyleSets,
  IProcessedStyleSet,
  getTheme
} from "@fluentui/react";

export interface ITabsViewStyles {
  section: IStyle;
  sectionHeader: IStyle;
  sectionTooltip: IStyle;
  buttonSection: IStyle;
  stackStyle: IStyle;
}

export const tabsViewStyles: () => IProcessedStyleSet<ITabsViewStyles> = () => {
  const theme = getTheme();
  return mergeStyleSets<ITabsViewStyles>({
    buttonSection: {
      textAlign: "center"
    },
    section: {
      textAlign: "left"
    },
    sectionHeader: {
      color: theme.semanticColors.bodyText,
      display: "block",
      overflow: "hidden",
      padding: "16px 24px 16px 40px",
      selectors: {
        ":hover": {
          height: "auto",
          overflow: "visible",
          whiteSpace: "normal"
        }
      },
      textOverflow: "ellipsis"
    },
    sectionTooltip: {
      display: "inline"
    },
    stackStyle: {
      padding: "20px",
      selectors: {
        "@media screen and (max-width: 479px)": {
          padding: "5px"
        }
      }
    }
  });
};
