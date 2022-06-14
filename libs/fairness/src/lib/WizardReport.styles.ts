// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  getTheme,
  IProcessedStyleSet,
  IStyle,
  mergeStyleSets,
  FontWeights
} from "@fluentui/react";

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
  dropDown: IStyle;
  mainRight: IStyle;
  insights: IStyle;
  insightsIcon: IStyle;
  insightsText: IStyle;
  chevronIcon: IStyle;
  tableWrapper: IStyle;
  closeButton: IStyle;
  multimodelSection: IStyle;
  modelLabel: IStyle;
  groupLabel: IStyle;
}

export const WizardReportStyles: () => IProcessedStyleSet<IWizardReportStyles> =
  () => {
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
      chevronIcon: {
        height: "6",
        marginRight: "10px",
        verticalAlign: "middle",
        width: "9"
      },
      closeButton: {
        color: theme.semanticColors.bodyText,
        float: "right",
        fontSize: "20px",
        fontWeight: "400",
        lineHeight: "20px",
        paddingLeft: "20px"
      },
      dropDown: {
        display: "inline-block",
        margin: "10px 0px"
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
      spinner: {
        margin: "auto",
        padding: "40px"
      },
      tableWrapper: {
        paddingBottom: "20px"
      }
    });
  };
