// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  getTheme,
  IProcessedStyleSet,
  IStyle,
  mergeStyleSets,
  FontWeights
} from "office-ui-fabric-react";

export interface IModelComparisonChartStyles {
  frame: IStyle;
  spinner: IStyle;
  header: IStyle;
  headerTitle: IStyle;
  editButton: IStyle;
  main: IStyle;
  mainRight: IStyle;
  rightTitle: IStyle;
  rightText: IStyle;
  insights: IStyle;
  insightsText: IStyle;
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
      padding: "60px 0 0 0"
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
      backgroundColor: theme.semanticColors.bodyFrameBackground,
      display: "inline-flex",
      flexDirection: "row",
      height: "90px",
      justifyContent: "space-between",
      padding: "0 90px"
    },
    headerTitle: {
      color: theme.semanticColors.bodyText,
      fontWeight: FontWeights.semibold
    },
    insights: {
      color: theme.semanticColors.bodyText,
      padding: "18px 0",
      textTransform: "uppercase"
    },
    insightsText: {
      borderBottom: "1px solid",
      borderColor: theme.semanticColors.bodyDivider,
      paddingBottom: "18px",
      paddingRight: "15px"
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
