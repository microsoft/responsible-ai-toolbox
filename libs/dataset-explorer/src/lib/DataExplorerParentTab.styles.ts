// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  IStyle,
  mergeStyleSets,
  IProcessedStyleSet,
  getTheme
} from "@fluentui/react";

export interface IDataExplorerParentTabStyles {
  container: IStyle;
  pivotLabelWrapper: IStyle;
}

export const dataExplorerParentTabStyles: () => IProcessedStyleSet<IDataExplorerParentTabStyles> =
  () => {
    const theme = getTheme();
    return mergeStyleSets<IDataExplorerParentTabStyles>({
      container: {
        color: theme.semanticColors.bodyText
      },
      pivotLabelWrapper: {
        display: "flex",
        flexDirection: "row",
        justifyContent: "start",
        padding: "0px 30px 15px"
      }
    });
  };
