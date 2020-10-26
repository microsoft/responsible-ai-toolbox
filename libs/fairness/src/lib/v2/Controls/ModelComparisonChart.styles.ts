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

export interface IModelComparisonChartStyles {
  frame: IStyle;
  spinner: IStyle;
  header: IStyle;
  headerTitle: IStyle;
  doneButton: IStyle;
  infoButton: IStyle;
  modalContentHelp: IStyle;
  modalContentHelpText: IStyle;
  editButton: IStyle;
  howTo: IStyle;
  main: IStyle;
  mainRight: IStyle;
  rightTitle: IStyle;
  rightText: IStyle;
  chart: IStyle;
  textSection: IStyle;
  radio: IStyle;
  radioOptions: IStyle;
}

export const ModelComparisonChartStyles: () => IProcessedStyleSet<
  IModelComparisonChartStyles
> = () => {
  const theme = getTheme();
  return mergeStyleSets<IModelComparisonChartStyles>({
    chart: {
      flex: 1,
      padding: "0px 0 0 0"
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
    editButton: {
      color: theme.semanticColors.buttonText
    },
    frame: {
      display: "flex",
      flex: 1,
      flexDirection: "column"
    },
    header: {
      alignItems: "center",
      backgroundColor: theme.semanticColors.bodyBackground,
      display: "inline-flex",
      flexDirection: "row",
      height: "90px",
      justifyContent: "space-between",
      padding: "0 90px"
    },
    headerTitle: {
      color: theme.semanticColors.bodyText,
      fontSize: "24px",
      fontWeight: FontWeights.semibold
    },
    howTo: {
      paddingLeft: "100px",
      paddingTop: "20px"
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
      marginTop: "3px",
      textAlign: "center",
      width: "15px"
    },
    main: {
      backgroundColor: theme.semanticColors.bodyBackground,
      display: "inline-flex",
      flex: 1,
      flexDirection: "row",
      height: "100%"
    },
    mainRight: {
      padding: "30px 0 0 35px",
      width: "300px"
    },
    modalContentHelp: {
      float: "left",
      width: "250px"
    },
    modalContentHelpText: {
      padding: "0px 20px",
      textAlign: "center",
      wordWrap: "break-word"
    },
    radio: {
      backgroundColor: theme.semanticColors.bodyBackground,
      paddingBottom: "30px",
      paddingLeft: "75px"
    },
    radioOptions: {
      color: theme.semanticColors.bodyText
    },
    rightText: {
      borderBottom: "0.5px dashed",
      borderColor: theme.semanticColors.bodyDivider,
      color: theme.semanticColors.bodyText,
      padding: "16px 15px 30px 0"
    },
    rightTitle: {
      borderBottom: "1px solid",
      borderColor: theme.semanticColors.bodyDivider,
      color: theme.semanticColors.bodyText,
      paddingBottom: "18px"
    },
    spinner: {
      margin: "auto",
      padding: "40px"
    },
    textSection: {
      color: theme.semanticColors.bodyText,
      paddingBottom: "5px"
    }
  });
};
