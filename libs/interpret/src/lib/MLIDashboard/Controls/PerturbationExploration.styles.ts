// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IStyle, mergeStyleSets, IProcessedStyleSet } from "@fluentui/react";

export interface IPerturbationExplorationStyles {
  flexWrapper: IStyle;
  loadingMessage: IStyle;
  labelGroup: IStyle;
  labelGroupLabel: IStyle;
  flexFull: IStyle;
  tileScroller: IStyle;
}

export const perturbationExplorationStyles: IProcessedStyleSet<IPerturbationExplorationStyles> =
  mergeStyleSets<IPerturbationExplorationStyles>({
    flexFull: {
      flex: 1
    },
    flexWrapper: {
      display: "flex",
      flexDirection: "column",
      overflow: "hidden"
    },
    labelGroup: {
      borderBottom: "1px solid",
      display: "flex",
      fontSize: "20px"
    },
    labelGroupLabel: {
      alignSelf: "center",
      paddingLeft: "10px",
      width: "150px"
    },
    loadingMessage: {
      borderBottom: "1px solid",
      display: "flex",
      fontSize: "20px",
      padding: "5px 10px"
    },
    tileScroller: {
      display: "flex",
      flex: 1,
      flexDirection: "row",
      flexWrap: "wrap",
      overflowY: "auto"
    }
  });
