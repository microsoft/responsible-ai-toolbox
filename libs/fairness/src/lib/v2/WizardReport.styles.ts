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

export interface IWizardReportStyles {
  spinner: IStyle;
  header: IStyle;
  multimodelButton: IStyle;
  headerTitle: IStyle;
  headerBanner: IStyle;
  headerOptions: IStyle;
  bannerWrapper: IStyle;
  metricText: IStyle;
  firstMetricLabel: IStyle;
  metricLabel: IStyle;
  expandAttributes: IStyle;
  overallArea: IStyle;
  presentationArea: IStyle;
  chartWrapper: IStyle;
  chartBody: IStyle;
  chartHeader: IStyle;
  dropDown: IStyle;
  main: IStyle;
  mainLeft: IStyle;
  mainRight: IStyle;
  rightTitle: IStyle;
  rightText: IStyle;
  insights: IStyle;
  insightsIcon: IStyle;
  insightsText: IStyle;
  downloadIcon: IStyle;
  downloadReport: IStyle;
  chevronIcon: IStyle;
  tableWrapper: IStyle;
  textRow: IStyle;
  infoButton: IStyle;
  doneButton: IStyle;
  closeButton: IStyle;
  performanceChartHeader: IStyle;
  howTo: IStyle;
  colorBlock: IStyle;
  multimodelSection: IStyle;
  modelLabel: IStyle;
  modalContentHelp: IStyle;
  modalContentHelpText: IStyle;
  groupLabel: IStyle;
  legendPanel: IStyle;
  legendTitle: IStyle;
  legendSubtitle: IStyle;
}

export const WizardReportStyles: () => IProcessedStyleSet<
  IWizardReportStyles
> = () => {
  const theme = getTheme();
  return mergeStyleSets<IWizardReportStyles>({
    bannerWrapper: {
      display: "inline-flex",
      flexDirection: "row",
      justifyContent: "space-between",
      paddingBottom: "15px",
      paddingTop: "18px",
      width: "100%"
    },
    chartBody: {
      flex: 1
    },
    chartHeader: {
      color: theme.semanticColors.bodyText,
      height: "23px",
      paddingLeft: "10px"
    },
    chartWrapper: {
      display: "flex",
      flex: "1 0 40%",
      flexDirection: "column"
    },
    chevronIcon: {
      height: "6",
      marginRight: "10px",
      verticalAlign: "middle",
      width: "9"
    },
    closeButton: {
      color: theme.semanticColors.bodyText,
      float: "right",
      fontFamily: "Arial",
      fontSize: "20px",
      fontWeight: "400",
      lineHeight: "20px",
      paddingLeft: "20px"
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
    downloadIcon: {
      height: "18",
      marginRight: "10px",
      verticalAlign: "middle",
      width: "17"
    },
    downloadReport: {
      color: theme.semanticColors.bodyText,
      fontSize: "12px",
      fontWeight: "normal",
      lineHeight: "16px",
      paddingBottom: "20px",
      paddingLeft: "0px",
      paddingTop: "20px"
    },
    dropDown: {
      display: "inline-block",
      margin: "10px 0px"
    },
    performanceChartHeader: {
      color: theme.semanticColors.bodyText,
      float: "left",
      fontSize: "18px",
      fontWeight: "normal",
      lineHeight: "22px",
      paddingLeft: "100px",
      paddingTop: "30px"
    },
    expandAttributes: {
      color: theme.semanticColors.bodyText,
      fontSize: "12px",
      fontWeight: "normal",
      height: "26px",
      lineHeight: "16px",
      marginBottom: "20px",
      marginLeft: "100px"
    },
    firstMetricLabel: {
      borderRight: "1px solid",
      borderRightColor: theme.semanticColors.bodyDivider,
      color: theme.semanticColors.bodyText,
      lineHeight: "16px",
      marginRight: "20px",
      maxWidth: "120px",
      padding: "8px 12px 0 12px"
    },
    groupLabel: {
      color: theme.semanticColors.bodyText
    },
    header: {
      backgroundColor: theme.semanticColors.bodyBackground,
      padding: "0 100px 20px 100px"
    },
    headerBanner: {
      display: "flex"
    },
    headerOptions: {
      backgroundColor: theme.semanticColors.bodyBackground
    },
    headerTitle: {
      color: theme.semanticColors.bodyText,
      paddingTop: "10px"
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
      marginLeft: "250px",
      marginRight: "3px",
      marginTop: "3px",
      textAlign: "center",
      width: "15px"
    },
    insights: {
      color: theme.semanticColors.bodyText,
      display: "inline",
      padding: "18px 0",
      textTransform: "uppercase"
    },
    insightsIcon: {
      height: "28",
      marginRight: "10px",
      verticalAlign: "middle",
      width: "24"
    },
    insightsText: {
      borderBottom: "1px solid",
      borderBottomColor: theme.semanticColors.bodyDivider,
      color: theme.semanticColors.bodyText,
      marginTop: "20px",
      paddingBottom: "18px",
      paddingRight: "15px"
    },
    legendPanel: {
      marginLeft: "100px"
    },
    legendSubtitle: {
      color: theme.semanticColors.bodySubtext,
      fontSize: "9px",
      fontStyle: "italic",
      lineHeight: "12x"
    },
    legendTitle: {
      color: theme.semanticColors.bodyText,
      fontSize: "12px",
      lineHeight: "16px"
    },
    main: {
      display: "flex",
      flexDirection: "row"
    },
    mainLeft: {
      backgroundColor: theme.semanticColors.bodyBackground,
      width: "75%"
    },
    mainRight: {
      backgroundColor: theme.semanticColors.bodyBackground,
      flexBasis: "300px",
      flexShrink: 1,
      minWidth: "200px",
      paddingLeft: "35px"
    },
    metricLabel: {
      color: theme.semanticColors.bodyText,
      maxWidth: "130px",
      paddingTop: "8px"
    },
    metricText: {
      color: theme.semanticColors.bodyText,
      fontSize: "36px",
      fontWeight: FontWeights.light,
      lineHeight: "44px",
      paddingRight: "12px"
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
    modelLabel: {
      alignSelf: "center",
      color: theme.semanticColors.bodyText,
      fontSize: "24px",
      paddingTop: "16px"
    },
    multimodelButton: {
      marginTop: "20px",
      padding: 0
    },
    multimodelSection: {
      display: "flex",
      flexDirection: "row"
    },
    overallArea: {
      backgroundColor: theme.semanticColors.bodyBackground,
      color: theme.semanticColors.bodyText,
      display: "flex",
      flexDirection: "row",
      padding: "20px 0 0 100px"
    },
    presentationArea: {
      backgroundColor: theme.semanticColors.bodyBackground,
      display: "flex",
      flexDirection: "row",
      padding: "20px 0 30px 100px"
    },
    rightText: {
      borderBottom: "0.5px dashed",
      borderBottomColor: theme.semanticColors.bodyDivider,
      color: theme.semanticColors.bodyText,
      padding: "16px 15px 30px 0"
    },
    rightTitle: {
      borderBottom: "1px solid",
      borderBottomColor: theme.semanticColors.bodyDivider,
      color: theme.semanticColors.bodyText,
      paddingBottom: "11px"
    },
    spinner: {
      margin: "auto",
      padding: "40px"
    },
    tableWrapper: {
      paddingBottom: "20px"
    },
    textRow: {
      alignItems: "center",
      color: theme.semanticColors.bodyText,
      display: "flex",
      flexDirection: "row",
      paddingBottom: "7px"
    }
  });
};
