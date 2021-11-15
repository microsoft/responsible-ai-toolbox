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
  buttonRow: IStyle;
  cPanel: IStyle;
  container: IStyle;
  customPredictBlock: IStyle;
  counterfactualList: IStyle;
  button: IStyle;
  boldText: IStyle;
  predictedBlock: IStyle;
  negativeNumber: IStyle;
  predictedLink: IStyle;
  positiveNumber: IStyle;
  searchBox: IStyle;
  tooltipWrapper: IStyle;
  tooltipColumn: IStyle;
  tooltipTable: IStyle;
  tooltipTitle: IStyle;
  tooltipHost: IStyle;
  headerText: IStyle;
  panelStyle: IStyle;
  stackHeader: IStyle;
  counterfactualName: IStyle;
  tooltipHostDisplay: IStyle;
}

export const counterfactualPanelStyles: () => IProcessedStyleSet<ICounterfactualPanelStyles> =
  () => {
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
      buttonRow: {
        padding: "20px 0"
      },
      container: {
        width: "100%"
      },
      counterfactualList: {
        height: "100%",
        width: "100%"
      },
      counterfactualName: {
        width: 200
      },
      cPanel: {
        float: "left",
        width: "100%"
      },
      customPredictBlock: {
        padding: "10px"
      },
      headerText: {
        paddingBottom: "6px"
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
      panelStyle: {
        selectors: {
          ".content": {
            paddingLeft: 24,
            paddingRight: 24
          },
          ".scrollableContent": { height: "100%", paddingTop: 1 }
        }
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
      predictedLink: {
        color: theme.palette.blue
      },
      searchBox: {
        width: "210px"
      },
      stackHeader: {
        paddingLeft: 24,
        paddingRight: 24
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
      tooltipHostDisplay: {
        display: "inline-block"
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
