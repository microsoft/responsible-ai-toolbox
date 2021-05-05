// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  FontWeights,
  getTheme,
  IProcessedStyleSet,
  IStyle,
  mergeStyleSets
} from "office-ui-fabric-react";

export interface ICasualIndividualStyles {
  callout: IStyle;
  container: IStyle;
  description: IStyle;
  infoButton: IStyle;
  label: IStyle;
  lasso: IStyle;
  link: IStyle;
  individualTable: IStyle;
  title: IStyle;
  individualChart: IStyle;
  modalContentHelp: IStyle;
  modalContentHelpText: IStyle;
}

export const CasualIndividualStyles: () => IProcessedStyleSet<
  ICasualIndividualStyles
> = () => {
  const theme = getTheme();
  return mergeStyleSets<ICasualIndividualStyles>({
    callout: {
      padding: "20px 24px",
      width: 320
    },
    container: {
      display: "flex",
      flex: 1,
      flexDirection: "row"
    },
    description: {
      display: "flex",
      justifyContent: "space-between",
      padding: "10px"
    },
    individualChart: {
      backgroundColor: "red"
    },
    individualTable: {
      width: "50%"
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
    label: {
      cursor: "pointer",
      display: "inline-block",
      flex: "1",
      fontSize: 14,
      textAlign: "left"
    },
    lasso: {
      cursor: "pointer",
      display: "inline-block",
      flex: "1",
      fontSize: 14,
      paddingTop: "25px",
      textAlign: "left"
    },
    link: {
      display: "block",
      marginTop: 20
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
    title: {
      fontWeight: FontWeights.semilight,
      marginBottom: 12
    }
  });
};
