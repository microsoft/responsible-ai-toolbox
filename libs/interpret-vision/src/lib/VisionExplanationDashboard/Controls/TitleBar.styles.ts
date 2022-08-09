// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  IStyle,
  mergeStyleSets,
  IProcessedStyleSet,
  getTheme
} from "@fluentui/react";

export interface ITitleBarStyles {
  errorIcon: IStyle;
  iconContainer: IStyle;
  successIcon: IStyle;
  titleBarLabel: IStyle;
  titleBarNumber: IStyle;
}

export const titleBarStyles: () => IProcessedStyleSet<ITitleBarStyles> = () => {
  const theme = getTheme();
  return mergeStyleSets<ITitleBarStyles>({
    errorIcon: {
      color: theme.semanticColors.errorIcon,
      fontSize: "large",
      fontWeight: "600"
    },
    iconContainer: {},
    successIcon: {
      color: theme.semanticColors.successIcon,
      fontSize: "large",
      fontWeight: "600"
    },
    titleBarLabel: {
      fontWeight: "600"
    },
    titleBarNumber: {
      color: theme.palette.blue
    }
  });
};
