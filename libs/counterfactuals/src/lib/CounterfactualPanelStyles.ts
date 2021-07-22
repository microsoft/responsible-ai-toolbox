// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  IProcessedStyleSet,
  mergeStyleSets,
  IStyle,
  getTheme
} from "office-ui-fabric-react";

export interface ICounterfactualPanelStyles {
  listContainer: IStyle;
  pane: IStyle;
  cPanel: IStyle;
  container: IStyle;
  customPredictBlock: IStyle;
  button: IStyle;
  boldText: IStyle;
  predictedBlock: IStyle;
  negativeNumber: IStyle;
  positiveNumber: IStyle;
  tooltipWrapper: IStyle;
  tooltipColumn: IStyle;
  tooltipTable: IStyle;
  tooltipTitle: IStyle;
  tooltipHost: IStyle;
}

export const counterfactualPanelStyles: () => IProcessedStyleSet<
  ICounterfactualPanelStyles
> = () => {
  const theme = getTheme();
  return mergeStyleSets<ICounterfactualPanelStyles>({
    boldText: {
      fontWeight: "600",
      paddingBottom: "5px"
    },
    button: {
      marginTop: "20px",
      minWidth: "150px",
      verticalAlign: "center"
    },
    container: {
      width: "100%"
    },
    cPanel: {
      float: "left",
      width: "100%"
    },
    customPredictBlock: {
      paddingTop: "5px"
    },
    listContainer: {
      height: "100%",
      maxWidth: "900px",
      overflow: "scroll"
    },
    negativeNumber: {
      color: theme.palette.red
    },
    pane: {
      border: "1px solid",
      width: "150px"
    },
    positiveNumber: {
      color: theme.palette.green
    },
    predictedBlock: {
      alignContent: "stretch",
      display: "flex",
      flexDirection: "row",
      paddingTop: "5px"
    },
    tooltipColumn: {
      alignItems: "flex-start",
      boxSizing: "border-box",
      display: "flex",
      flex: "auto",
      flexDirection: "column",
      maxWidth: "200px",
      minWidth: "60px",
      paddingRight: "10px",
      width: "max-content"
    },
    tooltipHost: {
      display: "inline-block",
      height: "100%",
      marginRight: "4px"
    },
    tooltipTable: {
      display: "flex",
      flexDirection: "row"
    },
    tooltipTitle: {
      paddingBottom: "8px"
    },
    tooltipWrapper: {
      padding: "10px 15px"
    }
  });
};
