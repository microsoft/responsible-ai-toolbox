// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
    getTheme,
    IProcessedStyleSet,
    IStyle,
    mergeStyleSets
  } from "office-ui-fabric-react";
  
  export interface ICasualIndividualStyles {
    container: IStyle;
    description: IStyle;
    infoButton: IStyle;
    label: IStyle;
    lasso: IStyle;
    individualTable: IStyle;
    leftPane: IStyle;
    rightPane:IStyle;
    individualChart: IStyle;
    modalContentHelp: IStyle;
    modalContentHelpText: IStyle;
  }
  
  export const CasualIndividualStyles: () => IProcessedStyleSet<ICasualIndividualStyles> = () => {
    const theme = getTheme();
    return mergeStyleSets<ICasualIndividualStyles>({
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
        backgroundColor: "red",
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
      leftPane: {
        height: "100%",
        padding: "10px",
        width: "70%"
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
      rightPane: {        
        width: "25%"
      },
    });
  };
  