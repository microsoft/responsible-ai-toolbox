// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  getTheme,
  IProcessedStyleSet,
  IStyle,
  mergeStyleSets,
  FontWeights,
  FontSizes
} from "@fluentui/react";

export interface IBinDialogStyles {
  frame: IStyle;
  header: IStyle;
  buttons: IStyle;
  saveButton: IStyle;
  cancelButton: IStyle;
  binCounter: IStyle;
  main: IStyle;
  controls: IStyle;
  scrollArea: IStyle;
  groupLabel: IStyle;
}

export const BinDialogStyles: () => IProcessedStyleSet<IBinDialogStyles> =
  () => {
    const theme = getTheme();
    return mergeStyleSets<IBinDialogStyles>({
      binCounter: {
        selectors: {
          "& label": {
            color: theme.semanticColors.bodyText,
            fontSize: FontSizes.mediumPlus,
            fontWeight: FontWeights.regular
          }
        }
      },
      buttons: {
        display: "inline-flex",
        flexDirection: "row-reverse",
        padding: "10px"
      },
      cancelButton: {
        height: "44px",
        padding: "12px"
      },
      controls: {
        alignItems: "center",
        borderBottom: "1px solid",
        borderBottomColor: theme.semanticColors.bodyDivider,
        display: "inline-flex",
        height: "30px",
        justifyContent: "space-between",
        marginBottom: "10px",
        paddingBottom: "10px",
        width: "100%"
      },
      frame: {
        backgroundColor: theme.semanticColors.bodyBackground,
        display: "flex",
        flexDirection: "column",
        height: "400px",
        width: "500px"
      },
      groupLabel: {
        borderBottom: "1px solid",
        borderBottomColor: theme.semanticColors.bodyDivider,
        color: theme.semanticColors.bodyText,
        height: "25px",
        paddingLeft: "12px"
      },
      header: {
        backgroundColor: theme.semanticColors.bodyFrameBackground,
        color: theme.semanticColors.bodyText,
        padding: "12px",
        textAlign: "center"
      },
      main: {
        display: "flex",
        flexDirection: "column",
        flexGrow: 1,
        overflow: "hidden",
        padding: "20px 40px"
      },
      saveButton: {
        height: "44px",
        marginLeft: "10px",
        padding: "12px"
      },
      scrollArea: {
        flexGrow: "2",
        overflowX: "hidden",
        overflowY: "auto"
      }
    });
  };
