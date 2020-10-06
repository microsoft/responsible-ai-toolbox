// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  getTheme,
  IProcessedStyleSet,
  IStyle,
  mergeStyleSets,
  FontWeights
} from "office-ui-fabric-react";

export interface IWizardReportStyles {
  spinner: IStyle;
  header: IStyle;
  multimodelButton: IStyle;
  headerTitle: IStyle;
  headerBanner: IStyle;
  bannerWrapper: IStyle;
  metricText: IStyle;
  firstMetricLabel: IStyle;
  metricLabel: IStyle;
  presentationArea: IStyle;
  chartWrapper: IStyle;
  chartBody: IStyle;
  chartHeader: IStyle;
  mainRight: IStyle;
  rightTitle: IStyle;
  rightText: IStyle;
  insights: IStyle;
  insightsText: IStyle;
  tableWrapper: IStyle;
  textRow: IStyle;
  colorBlock: IStyle;
  multimodelSection: IStyle;
  modelLabel: IStyle;
  groupLabel: IStyle;
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
    colorBlock: {
      height: "15px",
      marginRight: "9px",
      width: "15px"
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
      backgroundColor: theme.semanticColors.bodyStandoutBackground,
      padding: "0 90px"
    },
    headerBanner: {
      display: "flex"
    },
    headerTitle: {
      color: theme.semanticColors.bodyText,
      paddingTop: "10px"
    },
    insights: {
      color: theme.semanticColors.bodyText,
      padding: "18px 0",
      textTransform: "uppercase"
    },
    insightsText: {
      borderBottom: "1px solid",
      borderBottomColor: theme.semanticColors.bodyDivider,
      color: theme.semanticColors.bodyText,
      paddingBottom: "18px",
      paddingRight: "15px"
    },
    mainRight: {
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
    modelLabel: {
      alignSelf: "center",
      color: theme.semanticColors.bodyText,
      paddingLeft: "35px",
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
    presentationArea: {
      backgroundColor: theme.semanticColors.bodyBackground,
      display: "flex",
      flexDirection: "row",
      padding: "20px 0 30px 90px"
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
