// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  IStyle,
  mergeStyleSets,
  IProcessedStyleSet,
  getTheme
} from "@fluentui/react";

export interface INavigationStyles {
  breadcrumbItemWidth: IStyle;
  content: IStyle;
  dismissal: IStyle;
  dismissSingleLine: IStyle;
  iconContainer: IStyle;
  navigation: IStyle;
  root: IStyle;
  text: IStyle;
}

export const navigationStyles: () => IProcessedStyleSet<INavigationStyles> =
  () => {
    const theme = getTheme();
    return mergeStyleSets<INavigationStyles>({
      breadcrumbItemWidth: {
        width: "500px"
      },
      content: {
        margin: "0"
      },
      dismissal: {
        height: "24px",
        padding: "0"
      },
      dismissSingleLine: {
        margin: "0"
      },
      iconContainer: {
        height: "20px",
        margin: "4px 8px 0 12px"
      },
      navigation: {
        backgroundColor: theme.palette.white,
        borderTop: "1px solid #C8C8C8",
        boxSizing: "border-box",
        color: theme.palette.black,
        height: "25px",
        width: "100%"
      },
      root: {
        height: "24px",
        margin: "0",
        minHeight: "24px"
      },
      text: {
        height: "24px",
        margin: "4px 0 0"
      }
    });
  };
