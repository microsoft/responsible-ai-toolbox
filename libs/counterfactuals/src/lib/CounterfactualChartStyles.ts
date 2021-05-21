// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  IProcessedStyleSet,
  getTheme,
  mergeStyleSets,
  IStyle
} from "office-ui-fabric-react";

export interface ICounterfactualChartStyles {
  page: IStyle;
  parameterList: IStyle;
  featureList: IStyle;
  mainArea: IStyle;
  infoIcon: IStyle;
  infoWithText: IStyle;
  chartsArea: IStyle;
  topArea: IStyle;
  legendAndText: IStyle;
  cohortPickerWrapper: IStyle;
  cohortPickerLabel: IStyle;
  chartWithAxes: IStyle;
  chartWithVertical: IStyle;
  verticalAxis: IStyle;
  rotatedVerticalBox: IStyle;
  horizontalAxisWithPadding: IStyle;
  paddingDiv: IStyle;
  horizontalAxis: IStyle;
  featureImportanceArea: IStyle;
  featureImportanceControls: IStyle;
  featureImportanceLegend: IStyle;
  featureImportanceChartAndLegend: IStyle;
  legendLabel: IStyle;
  panelIconAndLabel: IStyle;
  multiclassWeightLabel: IStyle;
  multiclassWeightLabelText: IStyle;
  infoButton: IStyle;
  notAvailable: IStyle;
}

export const counterfactualChartStyles: () => IProcessedStyleSet<
  ICounterfactualChartStyles
> = () => {
  const legendWidth = "200px";
  const theme = getTheme();
  return mergeStyleSets<ICounterfactualChartStyles>({
    chartsArea: {
      flex: 1
    },
    chartWithAxes: {
      boxSizing: "border-box",
      display: "flex",
      flexDirection: "column",
      flexGrow: "1",
      paddingTop: "30px"
    },
    chartWithVertical: {
      display: "flex",
      flexDirection: "row",
      flexGrow: "1"
    },
    cohortPickerLabel: {
      fontWeight: "600",
      paddingRight: "8px"
    },
    cohortPickerWrapper: {
      alignItems: "center",
      display: "flex",
      flexDirection: "row",
      height: "32px",
      paddingLeft: "63px",
      paddingTop: "13px"
    },
    featureImportanceArea: {
      width: "100%"
    },
    featureImportanceChartAndLegend: {
      display: "flex",
      flexDirection: "row",
      height: "300px",
      width: "100%"
    },
    featureImportanceControls: {
      display: "flex",
      flexDirection: "row",
      padding: "18px 30px 4px 67px"
    },
    featureImportanceLegend: {
      height: "100%",
      width: legendWidth
    },
    featureList: {
      display: "flex",
      flexDirection: "column",
      flexGrow: 1,
      flexShrink: 1,
      maxHeight: "350px",
      overflowY: "auto"
    },
    horizontalAxis: {
      flex: 1,
      textAlign: "center"
    },
    horizontalAxisWithPadding: {
      display: "flex",
      flexDirection: "row",
      paddingBottom: "30px"
    },
    infoButton: {
      margin: "5px",
      padding: "8px 10px",
      width: "fit-content"
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
    legendAndText: {
      boxSizing: "border-box",
      height: "100%",
      paddingLeft: "10px",
      paddingRight: "10px",
      width: legendWidth
    },
    legendLabel: {
      paddingBottom: "10px",
      paddingTop: "10px"
    },
    mainArea: {
      alignItems: "stretch",
      display: "flex",
      flex: 1,
      flexDirection: "row-reverse",
      minHeight: "800px"
    },
    multiclassWeightLabel: {
      display: "inline-flex",
      paddingTop: "10px"
    },
    multiclassWeightLabelText: {
      fontWeight: "600",
      paddingTop: "5px"
    },
    notAvailable: {
      backgroundColor: theme.semanticColors.warningBackground
    },
    paddingDiv: {
      width: "50px"
    },
    page: {
      boxSizing: "border-box",
      padding: "16px 40px 0 14px",
      width: "100%"
    },
    panelIconAndLabel: {
      alignItems: "center",
      display: "flex",
      paddingTop: "10px"
    },
    parameterList: {
      backgroundColor: theme.palette.neutralLighter,
      display: "flex",
      flexDirection: "column",
      flexGrow: 1,
      margin: "8px 18px 30px 22px",
      padding: "6px 0 6px 12px"
    },
    rotatedVerticalBox: {
      marginLeft: "28px",
      position: "absolute",
      textAlign: "center",
      top: "50%",
      transform: "translateX(-50%) translateY(-50%) rotate(270deg)",
      width: "max-content"
    },
    topArea: {
      display: "flex",
      flexDirection: "row",
      height: "400px",
      width: "100%"
    },
    verticalAxis: {
      height: "auto",
      position: "relative",
      top: "0px",
      width: "67px"
    }
  });
};
