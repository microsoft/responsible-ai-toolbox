// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  getTheme,
  IProcessedStyleSet,
  IStyle,
  mergeStyleSets
} from "@fluentui/react";

export interface ITableViewStyles {
  chevronButton: IStyle;
  detailsList: IStyle;
  header: IStyle;
  headerCount: IStyle;
  headerTitle: IStyle;
  selectionCounter: IStyle;
  tabularDataView: IStyle;
}

export const tableViewStyles: () => IProcessedStyleSet<ITableViewStyles> =
  () => {
    const theme = getTheme();
    return mergeStyleSets({
      chevronButton: {
        marginLeft: 48,
        paddingTop: 6,
        width: 36
      },
      detailsList: {
        height: "500px",
        position: "relative"
      },
      header: {
        margin: "8px 0",
        padding: 8,
        // Overlay the sizer bars
        position: "relative",
        zIndex: 100
      },
      headerCount: [
        "headerCount",
        theme.fonts.medium,
        {
          paddingTop: 4
        }
      ],
      headerTitle: [
        theme.fonts.medium,
        {
          paddingTop: 4
        }
      ],
      selectionCounter: {
        paddingLeft: 25,
        paddingTop: 12
      },
      tabularDataView: { paddingLeft: 25 }
    });
  };
