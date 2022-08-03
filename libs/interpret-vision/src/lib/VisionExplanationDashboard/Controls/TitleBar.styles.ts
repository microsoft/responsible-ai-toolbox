// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IStyle, mergeStyleSets, IProcessedStyleSet } from "@fluentui/react";

export interface ITitleBarStyles {
  errorIcon: IStyle;
  iconContainer: IStyle;
  successIcon: IStyle;
  titleBarLabel: IStyle;
  titleBarNumber: IStyle;
}

export const titleBarStyles: () => IProcessedStyleSet<ITitleBarStyles> = () => {
  return mergeStyleSets<ITitleBarStyles>({
    errorIcon: {
      color: "#d13438",
      fontSize: "large",
      fontWeight: "600"
    },
    iconContainer: {
      position: "relative",
      top: "2px"
    },
    successIcon: {
      color: "#107c10",
      fontSize: "large",
      fontWeight: "600"
    },
    titleBarLabel: {
      fontWeight: "600"
    },
    titleBarNumber: {
      color: "#0078D4"
    }
  });
};
