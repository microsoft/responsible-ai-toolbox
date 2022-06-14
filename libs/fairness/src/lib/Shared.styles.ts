// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  FontSizes,
  FontWeights,
  getTheme,
  IProcessedStyleSet,
  IStyle,
  mergeStyleSets
} from "@fluentui/react";

export interface ISharedStyles {
  presentationArea: IStyle;
  actionButton: IStyle;
  callout: IStyle;
  chartWrapper: IStyle;
  chartBody: IStyle;
  chartHeader: IStyle;
  chartSubHeader: IStyle;
  header: IStyle;
  headerTitle: IStyle;
  mainLeft: IStyle;
  textRow: IStyle;
  colorBlock: IStyle;
  infoButton: IStyle;
  doneButton: IStyle;
  modalContentHelp: IStyle;
  modalContentHelpText: IStyle;
  calloutBarWrapper: IStyle;
  title: IStyle;
  toggle: IStyle;
  errorCalloutHeader: IStyle;
}

export const SharedStyles: () => IProcessedStyleSet<ISharedStyles> = () => {
  const theme = getTheme();
  return mergeStyleSets<ISharedStyles>({
    actionButton: {
      height: "auto"
    },
    callout: {
      padding: "20px 24px",
      width: 320
    },
    calloutBarWrapper: {
      marginLeft: "80px",
      padding: "15px 0px"
    },
    chartBody: {
      flex: 1
    },
    chartHeader: {
      color: theme.semanticColors.bodyText,
      float: "left",
      fontSize: "18px",
      fontWeight: "normal",
      lineHeight: "22px",
      paddingLeft: "100px",
      paddingTop: "30px"
    },
    chartSubHeader: {
      color: theme.semanticColors.bodyText,
      height: "23px",
      paddingLeft: "10px"
    },
    chartWrapper: {
      display: "flex",
      flex: "1 0 40%",
      flexDirection: "column"
    },
    colorBlock: {
      height: "15px",
      marginRight: "9px",
      width: "15px"
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
    errorCalloutHeader: {
      paddingRight: "5px"
    },
    header: {
      alignItems: "center",
      backgroundColor: theme.semanticColors.bodyBackground,
      display: "inline-flex",
      flexDirection: "row",
      height: "90px",
      justifyContent: "space-between"
    },
    headerTitle: {
      color: theme.semanticColors.bodyText,
      fontSize: "24px",
      fontWeight: FontWeights.semibold
    },
    infoButton: {
      border: "1px solid",
      borderRadius: "50%",
      float: "left",
      fontWeight: "600",
      height: "15px",
      lineHeight: "14px",
      margin: "3px",
      textAlign: "center",
      width: "15px"
    },
    mainLeft: {
      backgroundColor: theme.semanticColors.bodyBackground,
      height: "100%",
      width: "75%"
    },
    modalContentHelp: {
      float: "left",
      width: "350px"
    },
    modalContentHelpText: {
      padding: "0px 20px",
      textAlign: "center",
      wordWrap: "break-word"
    },
    presentationArea: {
      backgroundColor: theme.semanticColors.bodyBackground,
      display: "flex",
      flexDirection: "row",
      padding: "20px 0 30px 0"
    },
    textRow: {
      alignItems: "center",
      color: theme.semanticColors.bodyText,
      display: "flex",
      flexDirection: "row",
      paddingBottom: "7px"
    },
    title: {
      marginBottom: 12
    },
    toggle: {
      margin: "0px"
    }
  });
};
