// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  IStyle,
  mergeStyleSets,
  IProcessedStyleSet
} from "office-ui-fabric-react";

import { FabricStyles } from "../../FabricStyles";

export interface IGlobalTabStyles {
  page: IStyle;
  infoIcon: IStyle;
  helperText: IStyle;
  infoWithText: IStyle;
  globalChartControls: IStyle;
  sliderLabel: IStyle;
  topK: IStyle;
  startingK: IStyle;
  chartTypeDropdown: IStyle;
  globalChartWithLegend: IStyle;
  legendAndSort: IStyle;
  cohortLegend: IStyle;
  legendHelpText: IStyle;
  secondaryChartAndLegend: IStyle;
  chartEditorButton: IStyle;
  boldText: IStyle;
  cohortLegendWithTop: IStyle;
  rightJustifiedContainer: IStyle;
}

export const globalTabStyles: () => IProcessedStyleSet<
  IGlobalTabStyles
> = () => {
  const rightMarginWidth = "200px";
  return mergeStyleSets<IGlobalTabStyles>({
    boldText: {
      fontWeight: "600",
      paddingBottom: "5px"
    },
    chartEditorButton: [
      FabricStyles.chartEditorButton,
      {
        margin: "5px"
      }
    ],
    chartTypeDropdown: {
      margin: "0 5px 0 0"
    },
    cohortLegend: {
      fontWeight: "600",
      paddingBottom: "10px"
    },
    cohortLegendWithTop: {
      fontWeight: "600",
      paddingBottom: "10px",
      paddingTop: "10px"
    },
    globalChartControls: {
      display: "flex",
      flexDirection: "row",
      padding: "18px 300px 4px 67px"
    },
    globalChartWithLegend: {
      display: "flex",
      flexDirection: "row",
      height: "400px",
      position: "relative",
      width: "100%"
    },
    helperText: {
      paddingLeft: "15px",
      paddingRight: "120px"
    },
    infoIcon: {
      fontSize: "23px",
      height: "23px",
      width: "23px"
    },
    infoWithText: {
      boxSizing: "border-box",
      display: "flex",
      flexDirection: "row",
      paddingLeft: "25px",
      width: "100%"
    },
    legendAndSort: {
      height: "100%",
      width: rightMarginWidth
    },
    legendHelpText: {
      fontWeight: "300"
    },
    page: {
      boxSizing: "border-box",
      display: "flex",
      flexDirection: "column",
      height: "100%",
      padding: "16px 40px 0 14px",
      width: "100%"
    },
    rightJustifiedContainer: {
      boxSizing: "border-box",
      display: "inline-flex",
      flexDirection: "row",
      justifyContent: "flex-end",
      paddingRight: rightMarginWidth,
      width: "100%"
    },
    secondaryChartAndLegend: {
      display: "flex",
      flexDirection: "row",
      height: "300px",
      width: "100%"
    },
    sliderLabel: {
      fontWeight: "600",
      paddingRight: "10px"
    },
    startingK: {
      flex: 1
    },
    topK: {
      maxWidth: "200px"
    }
  });
};
