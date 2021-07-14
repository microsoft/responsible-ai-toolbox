// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  getTheme,
  IProcessedStyleSet,
  IStyle,
  mergeStyleSets,
  FontWeights,
  FontSizes
} from "office-ui-fabric-react";

export interface IDropdownBarStyles {
  frame: IStyle;
  spinner: IStyle;
  doneButton: IStyle;
  infoButton: IStyle;
  modalContentHelp: IStyle;
  modalContentHelpText: IStyle;
  toolTipWrapper: IStyle;
  mainRight: IStyle;
  actionButton: IStyle;
  title: IStyle;
  callout: IStyle;
}

export const DropdownBarStyles: () => IProcessedStyleSet<
  IDropdownBarStyles
> = () => {
  const theme = getTheme();
  return mergeStyleSets<IDropdownBarStyles>({
    actionButton: {
      height: "auto"
    },
    callout: {
      padding: "20px 24px",
      width: 320
    },
    doneButton: {
      color: theme.semanticColors.bodyText,
      fontSize: FontSizes.large,
      fontWeight: FontWeights.regular,
      height: "44px",
      lineHeight: "24px",
      margin: "auto",
      padding: "12px"
    },
    frame: {
      display: "flex",
      flex: 1,
      flexDirection: "column"
    },
    infoButton: {
      border: "1px solid",
      borderRadius: "50%",
      color: theme.semanticColors.bodyText,
      float: "left",
      fontSize: "12px",
      fontWeight: "600",
      height: "15px",
      lineHeight: "14px",
      marginRight: "3px",
      textAlign: "center",
      width: "15px"
    },
    mainRight: {
      padding: "30px 0 0 35px",
      width: "300px"
    },
    modalContentHelp: {},
    modalContentHelpText: {
      padding: "0px 20px",
      textAlign: "top",
      wordWrap: "break-word"
    },
    spinner: {
      margin: "auto",
      padding: "40px"
    },
    title: {
      marginBottom: 12
    },
    toolTipWrapper: {
      display: "flex",
      flexFlow: "row wrap"
    }
  });
};
