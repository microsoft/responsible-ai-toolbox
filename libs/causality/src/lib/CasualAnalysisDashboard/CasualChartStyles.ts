// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
    getTheme,
    IProcessedStyleSet,
    IStyle,
    mergeStyleSets
  } from "office-ui-fabric-react";
  
  export interface ICasualChartStyles {
    container: IStyle;
    leftPane: IStyle;
    rightPane: IStyle;
    description: IStyle;
    infoButton: IStyle;
    header: IStyle;
    whyMust: IStyle;
  }
  
  export const CasualChartStyles: () => IProcessedStyleSet<ICasualChartStyles> = () => {
    const theme = getTheme();
    return mergeStyleSets<ICasualChartStyles>({
      container: {
        display: "flex",
        flex: 1,
        flexDirection: "column"
      },
      description: {
        display: "flex",
        justifyContent: "space-between",        
        padding: "10px"
      },
      header: {
        fontSize: 16
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
      leftPane: {
        padding: "10px",
        width: "75%"
      },
      rightPane: {        
        width: "25%"
      },
      whyMust: {
        fontSize: 14
      }
    });
  };
  