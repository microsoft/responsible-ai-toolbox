// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  IStyle,
  mergeStyleSets,
  IProcessedStyleSet,
  getTheme
} from "@fluentui/react";
import { hideXxlUp } from "@responsible-ai/core-ui";

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
      padding: "16px 24px 16px 40px",
      textOverflow: "ellipsis",
      display: "block",
      overflow: "hidden"
    },
    sectionTooltip: {
      display: "inline",
      ...hideXxlUp
    },
    stackStyle: {
      selectors: {
        "@media screen and (min-width: 479px)": {
          padding: "20px"
        },
        "@media screen and (max-width: 479px)": {
          padding: "5px"
        }
      }
    }
  });
};
