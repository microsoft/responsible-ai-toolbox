// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  getTheme,
  IProcessedStyleSet,
  IStyle,
  mergeStyleSets
} from "office-ui-fabric-react";

export interface IOverallTableStyles {
  minMaxLabel: IStyle;
  groupCol: IStyle;
  groupLabel: IStyle;
  flexCol: IStyle;
  binBox: IStyle;
  binTitle: IStyle;
  binLabel: IStyle;
  sensitiveAttributes: IStyle;
  metricCol: IStyle;
  metricLabel: IStyle;
  metricBox: IStyle;
  frame: IStyle;
}

export const OverallTableStyles: () => IProcessedStyleSet<
  IOverallTableStyles
> = () => {
  const theme = getTheme();
  return mergeStyleSets<IOverallTableStyles>({
    binBox: {
      borderBottom: "0.5px solid",
      borderBottomColor: theme.semanticColors.inputBorder,
      display: "flex",
      flex: 1,
      flexDirection: "column",
      justifyContent: "center",
      width: "130px"
    },
    binLabel: {
      fontSize: "12px",
      fontWeight: "normal",
      lineHeight: "16px"
    },
    binTitle: {
      fontSize: "12px",
      fontWeight: "600",
      lineHeight: "16px"
    },
    flexCol: {
      borderTop: "0.5px solid",
      borderTopColor: theme.semanticColors.inputBorder,
      display: "flex",
      flex: 1,
      flexDirection: "column"
    },
    frame: {
      display: "flex",
      paddingBottom: "19px"
    },
    groupCol: {
      display: "inline-flex",
      flexDirection: "column",
      height: "100%",
      width: "max-content"
    },
    groupLabel: {
      fontSize: "12px",
      fontWeight: "500",
      height: "26px",
      lineHeight: "12px"
    },
    metricBox: {
      borderBottom: "0.5px solid",
      borderBottomColor: theme.semanticColors.inputBorder,
      display: "flex",
      flex: 1,
      flexDirection: "column",
      fontSize: "12px",
      fontWeight: "normal",
      justifyContent: "center",
      lineHeight: "16px",
      paddingLeft: "10px"
    },
    metricCol: {
      display: "inline-flex",
      flexDirection: "column",
      height: "100%",
      width: "120px"
    },
    metricLabel: {
      fontSize: "11px",
      fontWeight: "600",
      height: "26px",
      lineHeight: "16px",
      paddingLeft: "10px"
    },
    minMaxLabel: {
      backgroundColor: theme.semanticColors.bodyBackground,
      fontSize: "10px",
      fontWeight: "400",
      lineHeight: "20px",
      marginTop: "4px",
      padding: "1px 9px"
    },
    sensitiveAttributes: {
      fontSize: "12px",
      fontWeight: "normal",
      height: "26px",
      lineHeight: "16px",
      paddingLeft: "10px"
    }
  });
};
