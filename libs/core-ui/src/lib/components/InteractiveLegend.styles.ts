// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  IStyle,
  mergeStyleSets,
  IProcessedStyleSet,
  getTheme
} from "@fluentui/react";

export interface IInteractiveLegendStyles {
  root: IStyle;
  item: IStyle;
  circleColorBox: IStyle;
  squareColorBox: IStyle;
  diamondColorBox: IStyle;
  triangleColorBox: IStyle;
  triangleDownColorBox: IStyle;
  label: IStyle;
  editButton: IStyle;
  deleteButton: IStyle;
  disabledItem: IStyle;
  inactiveItem: IStyle;
  clickTarget: IStyle;
}

export const interactiveLegendStyles: (
  activated?: boolean,
  color?: string
) => IProcessedStyleSet<IInteractiveLegendStyles> = (
  activated?: boolean,
  color?: string
) => {
  const theme = getTheme();
  return mergeStyleSets<IInteractiveLegendStyles>({
    circleColorBox: {
      backgroundColor: color,
      borderRadius: "6px",
      cursor: "pointer",
      display: "inline-block",
      height: "12px",
      margin: "11px 4px 11px 8px",
      opacity: activated ? 1 : 0.4,
      width: "12px"
    },
    clickTarget: {
      alignItems: "center",
      cursor: "pointer",
      display: "flex",
      flex: "1",
      flexDirection: "row"
    },
    deleteButton: {
      color: theme.semanticColors.errorText,
      display: "inline-block",
      width: "16px"
    },
    diamondColorBox: {
      backgroundColor: color,
      cursor: "pointer",
      display: "inline-block",
      height: "11px",
      margin: "11px 4px 11px 8px",
      opacity: activated ? 1 : 0.4,
      transform: "rotate(45deg)",
      width: "11px"
    },
    disabledItem: {
      alignItems: "center",
      backgroundColor: theme.semanticColors.disabledBackground,
      display: "flex",
      flexDirection: "row",
      height: "34px",
      marginBottom: "1px"
    },
    editButton: {
      color: theme.semanticColors.buttonText,
      display: "inline-block",
      width: "16px"
    },
    inactiveItem: {
      alignItems: "center",
      color: theme.semanticColors.primaryButtonTextDisabled,
      display: "flex",
      flexDirection: "row",
      height: "34px",
      marginBottom: "1px"
    },
    item: {
      alignItems: "center",
      display: "flex",
      flexDirection: "row",
      height: "34px",
      marginBottom: "1px"
    },
    label: {
      cursor: "pointer",
      display: "inline-block",
      flex: "1"
    },
    root: {
      paddingBottom: "8px",
      paddingTop: "8px"
    },
    squareColorBox: {
      backgroundColor: color,
      cursor: "pointer",
      display: "inline-block",
      height: "11px",
      margin: "11px 4px 11px 8px",
      opacity: activated ? 1 : 0.4,
      width: "11px"
    },
    triangleColorBox: {
      borderBottom: "12px solid",
      borderLeft: "6px solid transparent",
      borderRight: "6px solid transparent",
      color,
      height: 0,
      margin: "11px 4px 11px 8px",
      opacity: activated ? 1 : 0.4,
      width: 0
    },
    triangleDownColorBox: {
      borderLeft: "6px solid transparent",
      borderRight: "6px solid transparent",
      borderTop: "12px solid",
      color,
      height: 0,
      margin: "11px 4px 11px 8px",
      opacity: activated ? 1 : 0.4,
      width: 0
    }
  });
};
