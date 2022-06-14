// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  getTheme,
  IProcessedStyleSet,
  IStyle,
  mergeStyleSets
} from "@fluentui/react";

export interface IInsightsStyles {
  insights: IStyle;
  insightsIcon: IStyle;
  insightsText: IStyle;
  // downloadIcon: IStyle;
  // downloadReport: IStyle;
  textSection: IStyle;
}

export const InsightsStyles: () => IProcessedStyleSet<IInsightsStyles> = () => {
  const theme = getTheme();
  return mergeStyleSets<IInsightsStyles>({
    // download button functionality to be added:
    // https://github.com/microsoft/responsible-ai-widgets/issues/66
    // downloadIcon: {
    //   height: "18",
    //   marginRight: "10px",
    //   verticalAlign: "middle",
    //   width: "17"
    // },
    // downloadReport: {
    //   color: theme.semanticColors.bodyText,
    //   fontSize: "12px",
    //   fontWeight: "normal",
    //   lineHeight: "16px",
    //   paddingBottom: "20px",
    //   paddingLeft: "0px",
    //   paddingTop: "20px"
    // },
    insights: {
      color: theme.semanticColors.bodyText,
      display: "inline",
      padding: "18px 10px",
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
      borderColor: theme.semanticColors.bodyDivider,
      marginTop: "20px",
      paddingBottom: "18px",
      paddingRight: "15px"
    },
    textSection: {
      color: theme.semanticColors.bodyText,
      paddingBottom: "5px"
    }
  });
};
