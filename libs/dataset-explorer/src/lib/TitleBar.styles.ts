// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  IStyle,
  mergeStyleSets,
  IProcessedStyleSet,
} from "@fluentui/react";

export interface IDatasetExplorerTabStyles {
  errorIcon: IStyle;
  iconContainer: IStyle;
  successIcon: IStyle;
  titleBarLabel: IStyle;
  titleBarNumber: IStyle;
}

export const titleBarStyles: () => IProcessedStyleSet<IDatasetExplorerTabStyles> =
  () => {
    return mergeStyleSets<IDatasetExplorerTabStyles>({
      errorIcon: {
        color: "#C50F1F",
        fontSize: "large",
        fontWeight: "600",
      },
      iconContainer: {
        position: "relative",
        top: "2px"
      },
      successIcon: {
        color: "#6BB700",
        fontSize: "large",
        fontWeight: "600",
      },
      titleBarLabel: {
        fontWeight: "600",
      },
      titleBarNumber: {
        color: "#0078D4"
      },
    });
  };
