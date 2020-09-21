// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  IStyle,
  mergeStyleSets,
  IProcessedStyleSet,
  getTheme
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
  missingParametersPlaceholder: IStyle;
  missingParametersPlaceholderSpacer: IStyle;
  faintText: IStyle;
  chartEditorButton: IStyle;
  callout: IStyle;
  boldText: IStyle;
  calloutWrapper: IStyle;
  calloutHeader: IStyle;
  calloutTitle: IStyle;
  calloutInner: IStyle;
  calloutActions: IStyle;
  calloutLink: IStyle;
  infoButton: IStyle;
  multiclassWeightLabel: IStyle;
  multiclassWeightLabelText: IStyle;
  cohortLegendWithTop: IStyle;
  rightJustifiedContainer: IStyle;
}

export const globalTabStyles: () => IProcessedStyleSet<
  IGlobalTabStyles
> = () => {
  const theme = getTheme();
  const rightMarginWidth = "200px";
  return mergeStyleSets<IGlobalTabStyles>({
    boldText: {
      fontWeight: "600",
      paddingBottom: "5px"
    },
    callout: {
      backgroundColor: theme.semanticColors.bodyBackground,
      boxSizing: "border-box",
      display: "flex",
      flexDirection: "column",
      padding: "10px 20px",
      width: "200px"
    },
    calloutActions: {
      marginTop: 20,
      position: "relative",
      whiteSpace: "nowrap",
      width: "100%"
    },
    calloutHeader: [FabricStyles.calloutHeader],
    calloutInner: [FabricStyles.calloutInner],
    calloutLink: [
      theme.fonts.medium,
      {
        color: theme.palette.neutralPrimary
      }
    ],
    calloutTitle: [FabricStyles.calloutTitle],
    calloutWrapper: [FabricStyles.calloutWrapper],
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
    faintText: [FabricStyles.faintText],
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
    legendAndSort: {
      height: "100%",
      width: rightMarginWidth
    },
    legendHelpText: {
      fontWeight: "300"
    },
    missingParametersPlaceholder: [FabricStyles.missingParameterPlaceholder],
    missingParametersPlaceholderSpacer: [
      FabricStyles.missingParameterPlaceholderSpacer
    ],
    multiclassWeightLabel: {
      display: "inline-flex",
      paddingTop: "10px"
    },
    multiclassWeightLabelText: {
      fontWeight: "600",
      paddingTop: "5px"
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
