// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  IStyle,
  mergeStyleSets,
  IProcessedStyleSet,
  getTheme
} from "office-ui-fabric-react";

export interface IInteractiveLegendStyles {
  root: IStyle;
  item: IStyle;
  colorBox: IStyle;
  label: IStyle;
  editButton: IStyle;
  deleteButton: IStyle;
  disabledItem: IStyle;
  inactiveColorBox: IStyle;
  inactiveItem: IStyle;
  clickTarget: IStyle;
}

export const interactiveLegendStyles: () => IProcessedStyleSet<IInteractiveLegendStyles> =
  () => {
    const theme = getTheme();
    return mergeStyleSets<IInteractiveLegendStyles>({
      clickTarget: {
        alignItems: "center",
        cursor: "pointer",
        display: "flex",
        flex: "1",
        flexDirection: "row"
      },
      colorBox: {
        borderRadius: "6px",
        cursor: "pointer",
        display: "inline-block",
        height: "12px",
        margin: "11px 4px 11px 8px",
        width: "12px"
      },
      deleteButton: {
        color: theme.semanticColors.errorText,
        display: "inline-block",
        width: "16px"
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
      inactiveColorBox: {
        borderRadius: "6px",
        cursor: "pointer",
        display: "inline-block",
        height: "12px",
        margin: "11px 4px 11px 8px",
        opacity: 0.4,
        width: "12px"
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
      }
    });
  };
