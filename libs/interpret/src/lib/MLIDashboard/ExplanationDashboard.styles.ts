// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  IStyle,
  mergeStyleSets,
  IProcessedStyleSet
} from "office-ui-fabric-react";

export interface IExplanationDashboardStyles {
  explainerDashboard: IStyle;
  chartsWrapper: IStyle;
  globalChartsWrapper: IStyle;
  localChartsWrapper: IStyle;
  localPlaceholder: IStyle;
  placeholderText: IStyle;
  tabbedViewer: IStyle;
  viewPanel: IStyle;
  localCommands: IStyle;
  clearButton: IStyle;
}

export const explanationDashboardStyles: IProcessedStyleSet<IExplanationDashboardStyles> = mergeStyleSets<
  IExplanationDashboardStyles
>({
  explainerDashboard: {
    width: "100%",
    height: "100%"
  },
  chartsWrapper: {
    flexGrow: 1,
    display: "flex",
    overflow: "hidden",
    width: "100%",
    height: "100%",
    flexDirection: "column"
  },
  globalChartsWrapper: {
    width: "100%",
    height: "55%",
    display: "flex",
    flexDirection: "row"
  },
  localChartsWrapper: {
    width: "100%",
    borderTopWidth: "2px",
    borderTopStyle: "solid",
    boxSizing: "border-box",
    height: "45%"
  },
  localPlaceholder: {
    height: "100px",
    display: "flex",
    alignItems: "center",
    fontSize: "25px"
  },
  placeholderText: {
    margin: "auto",
    fontFamily: `Segoe UI", "Segoe UI Web (West European)", "Segoe UI",
      -apple-system, BlinkMacSystemFont, Roboto, "Helvetica Neue",
      sans-serif`,
    padding: "40px",
    lineHeight: "35px"
  },
  tabbedViewer: {
    display: "flex",
    flexDirection: "row",
    height: "100%"
  },
  viewPanel: {
    display: "flex",
    flexDirection: "column",
    width: "100%"
  },
  localCommands: {
    display: "flex",
    width: "100%",
    flexDirection: "row",
    borderBottomWidth: "1px",
    borderBottomStyle: "solid"
  },
  clearButton: {
    flex: 1
  }
});
