// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IStyle, mergeStyleSets, IProcessedStyleSet } from "@fluentui/react";

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

export const explanationDashboardStyles: IProcessedStyleSet<IExplanationDashboardStyles> =
  mergeStyleSets<IExplanationDashboardStyles>({
    chartsWrapper: {
      display: "flex",
      flexDirection: "column",
      flexGrow: 1,
      height: "100%",
      overflow: "hidden",
      width: "100%"
    },
    clearButton: {
      flex: 1
    },
    explainerDashboard: {
      height: "100%",
      width: "100%"
    },
    globalChartsWrapper: {
      display: "flex",
      flexDirection: "row",
      height: "55%",
      width: "100%"
    },
    localChartsWrapper: {
      borderTopStyle: "solid",
      borderTopWidth: "2px",
      boxSizing: "border-box",
      height: "45%",
      width: "100%"
    },
    localCommands: {
      borderBottomStyle: "solid",
      borderBottomWidth: "1px",
      display: "flex",
      flexDirection: "row",
      width: "100%"
    },
    localPlaceholder: {
      alignItems: "center",
      display: "flex",
      fontSize: "25px",
      height: "100px"
    },
    placeholderText: {
      lineHeight: "35px",
      margin: "auto",
      padding: "40px"
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
    }
  });
