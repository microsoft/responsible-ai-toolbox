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

export interface IIntroTabStyles {
  firstSection: IStyle;
  firstSectionContainer: IStyle;
  firstSectionTitle: IStyle;
  firstSectionSubtitle: IStyle;
  firstSectionBody: IStyle;
  firstSectionGraphics: IStyle;
  lowerSection: IStyle;
  stepsContainer: IStyle;
  boldStep: IStyle;
  numericLabel: IStyle;
  explanatoryStep: IStyle;
  explanatoryText: IStyle;
  getStarted: IStyle;
}

export const IntroTabStyles: () => IProcessedStyleSet<IIntroTabStyles> = () => {
  const theme = getTheme();
  return mergeStyleSets<IIntroTabStyles>({
    boldStep: {
      flex: 1,
      maxWidth: "300px",
      paddingRight: "25px"
    },
    explanatoryStep: {
      flex: 1,
      maxWidth: "300px",
      paddingRight: "20px"
    },
    explanatoryText: {
      paddingTop: "15px"
    },
    firstSection: {
      backgroundColor: theme.semanticColors.bodyBackground,
      color: theme.semanticColors.bodyText,
      padding: "43px 94px"
    },
    firstSectionBody: {
      fontWeight: FontWeights.semilight,
      lineHeight: "24px",
      maxWidth: "500px",
      paddingBottom: "70px",
      paddingTop: "30px"
    },
    firstSectionContainer: {
      height: "250px",
      width: "100%"
    },
    firstSectionGraphics: {
      background: theme.semanticColors.bodyBackground,
      fill: theme.semanticColors.bodyText,
      height: "154px",
      stroke: theme.semanticColors.bodyText,
      width: "346px"
    },
    firstSectionSubtitle: {
      fontSize: "42px",
      fontWeight: FontWeights.semibold,
      lineHeight: "50px"
    },
    firstSectionTitle: {
      fontSize: "42px",
      fontWeight: FontWeights.light,
      lineHeight: "50px"
    },
    getStarted: {
      fontSize: FontSizes.size14,
      fontWeight: "400",
      lineHeight: "24px",
      padding: "12px"
    },
    lowerSection: {
      backgroundColor: theme.semanticColors.bodyBackground,
      color: theme.semanticColors.bodyText,
      flexGrow: 1,
      padding: "50px 70px 90px 90px"
    },
    numericLabel: {
      fontWeight: FontWeights.bold,
      marginRight: "5px",
      width: "20px"
    },
    stepsContainer: {
      borderBottom: "1px solid",
      borderBottomColor: theme.semanticColors.bodyDivider,
      display: "flex",
      flexDirection: "row",
      justifyContent: "space-between",
      paddingBottom: "38px"
    }
  });
};
