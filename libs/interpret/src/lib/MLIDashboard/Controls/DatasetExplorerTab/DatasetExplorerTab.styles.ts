import { IStyle, mergeStyleSets, IProcessedStyleSet, getTheme } from "office-ui-fabric-react";
import { FabricStyles } from "../../FabricStyles";

export interface IDatasetExplorerTabStyles {
  page: IStyle;
  infoIcon: IStyle;
  helperText: IStyle;
  infoWithText: IStyle;
  mainArea: IStyle;
  chartWithAxes: IStyle;
  chartWithVertical: IStyle;
  verticalAxis: IStyle;
  rotatedVerticalBox: IStyle;
  chart: IStyle;
  legendAndText: IStyle;
  horizontalAxisWithPadding: IStyle;
  paddingDiv: IStyle;
  horizontalAxis: IStyle;
  cohortPickerWrapper: IStyle;
  cohortPickerLabel: IStyle;
  boldText: IStyle;
  colorBox: IStyle;
  legendLabel: IStyle;
  legendItem: IStyle;
  legend: IStyle;
  callout: IStyle;
  chartEditorButton: IStyle;
  missingParametersPlaceholder: IStyle;
  missingParametersPlaceholderSpacer: IStyle;
  faintText: IStyle;
  smallItalic: IStyle;
}

export const datasetExplorerTabStyles: () => IProcessedStyleSet<IDatasetExplorerTabStyles> = () => {
  const theme = getTheme();
  return mergeStyleSets<IDatasetExplorerTabStyles>({
    page: {
      width: "100%",
      height: "100%",
      padding: "16px 0 0 14px",
      boxSizing: "border-box",
      display: "flex",
      flexDirection: "column",
    },
    infoWithText: {
      display: "flex",
      flexDirection: "row",
      width: "100%",
      boxSizing: "border-box",
      paddingLeft: "25px",
    },
    infoIcon: {
      width: "23px",
      height: "23px",
      fontSize: "23px",
    },
    helperText: {
      paddingRight: "160px",
      paddingLeft: "15px",
    },
    chartWithAxes: {
      display: "flex",
      flexGrow: "1",
      boxSizing: "border-box",
      paddingTop: "30px",
      flexDirection: "column",
      paddingRight: "10px",
    },
    chartWithVertical: {
      display: "flex",
      flexGrow: "1",
      flexDirection: "row",
      position: "relative",
    },
    chart: {
      flexGrow: "1",
    },
    mainArea: {
      width: "100%",
      height: "600px",
      display: "flex",
      flexDirection: "row",
    },
    legendAndText: {
      width: "195px",
      height: "100%",
    },
    verticalAxis: {
      position: "relative",
      top: "0px",
      height: "auto",
      width: "64px",
    },
    rotatedVerticalBox: {
      transform: "translateX(-50%) translateY(-50%) rotate(270deg)",
      marginLeft: "28px",
      position: "absolute",
      top: "50%",
      textAlign: "center",
      width: "max-content",
    },
    horizontalAxisWithPadding: {
      display: "flex",
      paddingBottom: "30px",
      flexDirection: "row",
    },
    paddingDiv: {
      width: "50px",
    },
    horizontalAxis: {
      flex: 1,
      textAlign: "center",
    },
    cohortPickerWrapper: {
      paddingLeft: "63px",
      paddingTop: "13px",
      height: "32px",
      display: "flex",
      flexDirection: "row",
      alignItems: "center",
    },
    cohortPickerLabel: {
      fontWeight: "600",
      paddingRight: "8px",
    },
    boldText: {
      fontWeight: "600",
      paddingBottom: "5px",
    },
    colorBox: {
      margin: "11px 4px 11px 8px",
      width: "12px",
      height: "12px",
      display: "inline-block",
      borderRadius: "6px",
      cursor: "pointer",
    },
    legendLabel: {
      display: "inline-block",
      flex: "1",
    },
    legendItem: {
      height: "28px",
      display: "flex",
      flexDirection: "row",
      alignItems: "center",
    },
    legend: {},
    callout: {
      width: "200px",
      boxSizing: "border-box",
      display: "flex",
      flexDirection: "column",
      padding: "10px 20px",
      backgroundColor: theme.semanticColors.bodyBackground,
    },
    chartEditorButton: [
      FabricStyles.chartEditorButton,
      {
        position: "absolute",
        zIndex: 10,
        right: "10px",
      },
    ],
    missingParametersPlaceholder: [FabricStyles.missingParameterPlaceholder],
    missingParametersPlaceholderSpacer: [FabricStyles.missingParameterPlaceholderSpacer],
    faintText: [FabricStyles.faintText],
    smallItalic: [FabricStyles.placeholderItalic],
  });
};
