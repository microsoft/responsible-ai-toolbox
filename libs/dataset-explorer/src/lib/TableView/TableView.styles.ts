// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IProcessedStyleSet, IStyle, mergeStyleSets } from "@fluentui/react";

export interface ITableViewStyles {
  detailsList: IStyle;
  selectionCounter: IStyle;
  tabularDataView: IStyle;
}

export const tableViewStyles: () => IProcessedStyleSet<ITableViewStyles> =
  () => {
    return mergeStyleSets({
      detailsList: {
        height: "500px",
        position: "relative"
      },
      selectionCounter: {
        paddingLeft: 25,
        paddingTop: 12
      },
      tabularDataView: { paddingLeft: 25 }
    });
  };
