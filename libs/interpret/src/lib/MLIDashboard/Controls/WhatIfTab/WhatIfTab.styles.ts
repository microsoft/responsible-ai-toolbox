// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  IProcessedStyleSet,
  getTheme,
  mergeStyleSets,
  IStyle
} from "@fluentui/react";
import {
  descriptionMaxWidth,
  flexLgDown,
  FluentUIStyles
} from "@responsible-ai/core-ui";

export interface IWhatIfTabStyles {
  absoluteValueToggle: IStyle;
  page: IStyle;
  blackIcon: IStyle;
  expandedPanel: IStyle;
  expandedInPanel: IStyle;
  parameterList: IStyle;
  featureList: IStyle;
  collapsedPanel: IStyle;
  mainArea: IStyle;
  infoIcon: IStyle;
  helperText: IStyle;
  infoWithText: IStyle;
  chartsArea: IStyle;
  topArea: IStyle;
  legendAndText: IStyle;
  cohortPickerWrapper: IStyle;
  cohortPickerLabel: IStyle;
  boldText: IStyle;
  chartWithAxes: IStyle;
  chartWithVertical: IStyle;
  verticalAxis: IStyle;
  rotatedVerticalBox: IStyle;
  horizontalAxisWithPadding: IStyle;
  paddingDiv: IStyle;
  horizontalAxis: IStyle;
  featureImportanceArea: IStyle;
  sliderLabel: IStyle;
  startingK: IStyle;
  featureImportanceControls: IStyle;
  featureImportanceLegend: IStyle;
  featureImportanceChartAndLegend: IStyle;
  legendHelpText: IStyle;
  legendLabel: IStyle;
  smallItalic: IStyle;
  legendHlepWrapper: IStyle;
  choiceBoxArea: IStyle;
  choiceGroupFlexContainer: IStyle;
  panelIconAndLabel: IStyle;
  predictedBlock: IStyle;
  upperWhatIfPanel: IStyle;
  saveButton: IStyle;
  customPredictBlock: IStyle;
  featureSearch: IStyle;
  iceFeatureSelection: IStyle;
  iceClassSelection: IStyle;
  disclaimerWrapper: IStyle;
  errorText: IStyle;
  tooltipColumn: IStyle;
  tooltipTable: IStyle;
  tooltipTitle: IStyle;
  tooltipHost: IStyle;
  negativeNumber: IStyle;
  positiveNumber: IStyle;
  tooltipWrapper: IStyle;
  multiclassWeightLabel: IStyle;
  multiclassWeightLabelText: IStyle;
  calloutWrapper: IStyle;
  calloutHeader: IStyle;
  calloutTitle: IStyle;
  calloutInner: IStyle;
  calloutActions: IStyle;
  calloutLink: IStyle;
  infoButton: IStyle;
  rightJustifiedContainer: IStyle;
  notAvailable: IStyle;
  subPlotContainer: IStyle;
  choiceGroupLabel: IStyle;
}

export const whatIfTabStyles: () => IProcessedStyleSet<IWhatIfTabStyles> =
  () => {
    const legendWidth = "160px";
    const theme = getTheme();
    return mergeStyleSets<IWhatIfTabStyles>({
      absoluteValueToggle: {
        width: "170px"
      },
      blackIcon: {
        color: theme.semanticColors.bodyText
      },
      boldText: {
        fontWeight: "600",
        padding: "0 30px 5px 0"
      },
      calloutActions: {
        marginTop: 20,
        position: "relative",
        whiteSpace: "nowrap",
        width: "100%"
      },
      calloutHeader: [FluentUIStyles.calloutHeader],
      calloutInner: [FluentUIStyles.calloutInner],
      calloutLink: [
        theme.fonts.medium,
        {
          color: theme.semanticColors.bodyText
        }
      ],
      calloutTitle: [FluentUIStyles.calloutTitle],
      calloutWrapper: [FluentUIStyles.calloutWrapper],
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
      choiceBoxArea: {
        alignItems: "baseline",
        display: "flex",
        flexDirection: "row",
        flexFlow: "wrap"
      },
      choiceGroupFlexContainer: {
        justifyContent: "space-between",
        selectors: {
          "@media screen and (min-width: 1023px)": {
            display: "inline-flex"
          }
        },
        width: "auto"
      },
      choiceGroupLabel: {
        selectors: {
          "label.ms-ChoiceField-field": {
            marginRight: "15px"
          }
        }
      },
      cohortPickerLabel: {
        fontWeight: "600",
        padding: "0 8px 10px 0"
      },
      cohortPickerWrapper: {
        alignItems: "center",
        display: "flex",
        flexDirection: "row",
        height: "32px",
        paddingLeft: "63px",
        paddingTop: "13px"
      },
      collapsedPanel: {
        backgroundColor: theme.semanticColors.bodyBackground,
        boxShadow:
          "0px 4.8px 14.4px rgba(0, 0, 0, 0.18), 0px 25.6px 57.6px rgba(0, 0, 0, 0.22)",
        width: "40px"
      },
      customPredictBlock: {
        paddingTop: "5px"
      },
      disclaimerWrapper: {
        padding: "5px 15px 10px 26px"
      },
      errorText: {
        color: theme.semanticColors.errorText
      },
      expandedInPanel: {
        marginTop: "10px",
        paddingRight: "40px"
      },
      expandedPanel: {
        backgroundColor: theme.semanticColors.bodyBackground,
        boxShadow:
          "0px 4.8px 14.4px rgba(0, 0, 0, 0.18), 0px 25.6px 57.6px rgba(0, 0, 0, 0.22)",
        marginTop: "10px",
        paddingRight: "40px",
        width: "250px"
      },
      featureImportanceArea: {
        width: "100%"
      },
      featureImportanceChartAndLegend: {
        display: "flex",
        flexDirection: "row",
        minHeight: "300px",
        width: "100%",
        ...flexLgDown
      },
      featureImportanceControls: {
        display: "flex",
        flexDirection: "row",
        padding: "18px 30px 4px 67px",
        selectors: {
          "@media screen and (max-width: 639px)": {
            flexFlow: "wrap",
            padding: "18px 0 4px 0"
          }
        }
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
      featureSearch: {
        marginBottom: "8px",
        marginRight: "10px"
      },
      helperText: {
        paddingLeft: "15px",
        paddingRight: "120px"
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
      iceClassSelection: {
        margin: "10px 10px 10px 0"
      },
      iceFeatureSelection: {
        margin: "43px 10px 10px 0"
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
        maxWidth: descriptionMaxWidth,
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
      legendHelpText: {
        fontWeight: "300",
        lineHeight: "14px",
        width: "120px"
      },
      legendHlepWrapper: {
        width: "120px"
      },
      legendLabel: {
        fontWeight: "600",
        paddingBottom: "5px",
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
      negativeNumber: {
        color: theme.palette.red
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
      positiveNumber: {
        color: theme.palette.green
      },
      predictedBlock: {
        alignContent: "stretch",
        display: "flex",
        flexDirection: "row",
        paddingTop: "5px"
      },
      rightJustifiedContainer: {
        boxSizing: "border-box",
        display: "inline-flex",
        flexDirection: "row",
        justifyContent: "flex-end",
        paddingRight: legendWidth,
        selectors: {
          "@media screen and (max-width: 639px)": {
            paddingRight: "0"
          }
        },
        width: "100%"
      },
      rotatedVerticalBox: {
        marginLeft: "28px",
        position: "absolute",
        textAlign: "center",
        top: "50%",
        transform: "translateX(-50%) translateY(-50%) rotate(270deg)",
        width: "max-content"
      },
      saveButton: {
        margin: "0 0 10px 24px"
      },
      sliderLabel: {
        fontWeight: "600",
        paddingRight: "10px"
      },
      smallItalic: {
        color: theme.semanticColors.disabledBodyText,
        fontStyle: "italic",
        padding: "0 0 5px 5px"
      },
      startingK: {
        flex: 1,
        selectors: {
          "@media screen and (min-width: 1024px)": {
            paddingRight: legendWidth
          }
        }
      },
      subPlotContainer: { paddingLeft: 25 },
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
      },
      topArea: {
        display: "flex",
        flexDirection: "row",
        height: "400px",
        width: "100%"
      },
      upperWhatIfPanel: {
        paddingLeft: "32px",
        paddingRight: "32px"
      },
      verticalAxis: {
        height: "auto",
        position: "relative",
        top: "0px",
        width: "67px"
      }
    });
  };
