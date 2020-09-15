// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  IStyle,
  mergeStyleSets,
  IProcessedStyleSet
} from "office-ui-fabric-react";

export interface IPerturbationExplorationStyles {
  flexWrapper: IStyle;
  loadingMessage: IStyle;
  labelGroup: IStyle;
  labelGroupLabel: IStyle;
  flexFull: IStyle;
  tileScroller: IStyle;
}

export const perturbationExplorationStyles: IProcessedStyleSet<IPerturbationExplorationStyles> = mergeStyleSets<
  IPerturbationExplorationStyles
>({
  flexWrapper: {
    display: "flex",
    flexDirection: "column",
    overflow: "hidden"
  },
  loadingMessage: {
    display: "flex",
    fontFamily: `"Segoe UI", "Segoe UI Web (West European)", "Segoe UI",
          -apple-system, BlinkMacSystemFont, Roboto, "Helvetica Neue", sans-serif`,
    fontSize: "20px",
    borderBottom: "1px solid",
    padding: "5px 10px"
  },
  labelGroup: {
    display: "flex",
    fontFamily: `"Segoe UI", "Segoe UI Web (West European)", "Segoe UI",
          -apple-system, BlinkMacSystemFont, Roboto, "Helvetica Neue", sans-serif`,
    fontSize: "20px",
    borderBottom: "1px solid"
  },
  labelGroupLabel: {
    width: "150px",
    alignSelf: "center",
    paddingLeft: "10px"
  },
  flexFull: {
    flex: 1
  },
  tileScroller: {
    flex: 1,
    overflowY: "auto",
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap"
  }
});
