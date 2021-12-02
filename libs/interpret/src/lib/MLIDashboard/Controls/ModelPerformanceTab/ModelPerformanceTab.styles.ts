// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  IStyle,
  mergeStyleSets,
  IProcessedStyleSet,
  getTheme
} from "office-ui-fabric-react";

export interface IModelPerformanceTabStyles {
  page: IStyle;
  infoIcon: IStyle;
  helperText: IStyle;
  infoWithText: IStyle;
  scrollableWrapper: IStyle;
  scrollContent: IStyle;
  chartWithAxes: IStyle;
  chartWithVertical: IStyle;
  verticalAxis: IStyle;
  rotatedVerticalBox: IStyle;
  chart: IStyle;
  rightPanel: IStyle;
  statsBox: IStyle;
  horizontalAxisWithPadding: IStyle;
  paddingDiv: IStyle;
  horizontalAxis: IStyle;
  cohortPickerWrapper: IStyle;
  cohortPickerLabel: IStyle;
  boldText: IStyle;
}

export const modelPerformanceTabStyles: () => IProcessedStyleSet<IModelPerformanceTabStyles> =
  () => {
    const theme = getTheme();
    return mergeStyleSets<IModelPerformanceTabStyles>({
      boldText: {
        fontWeight: "600",
        paddingBottom: "5px"
      },
      chart: {
        flexGrow: "1"
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
      helperText: {
        paddingLeft: "15px",
        paddingRight: "160px"
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
      paddingDiv: {
        width: "50px"
      },
      page: {
        boxSizing: "border-box",
        color: theme.semanticColors.bodyText,
        display: "flex",
        flexDirection: "column",
        height: "100%",
        padding: "16px 40px 0 14px",
        width: "100%"
      },
      rightPanel: {
        backgroundColor: theme.semanticColors.bodyBackgroundChecked,
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        height: "100%",
        justifyContent: "space-evenly",
        padding: "10px 15px 11px 30px",
        width: "195px"
      },
      rotatedVerticalBox: {
        marginLeft: "28px",
        position: "absolute",
        textAlign: "center",
        top: "50%",
        transform: "translateX(-50%) translateY(-50%) rotate(270deg)",
        width: "max-content"
      },
      scrollableWrapper: {
        flexGrow: "1",
        maxHeight: "700px",
        overflowY: "scroll"
      },
      scrollContent: {
        alignItems: "stretch",
        display: "flex",
        flexDirection: "row",
        height: "500px",
        width: "100%"
      },
      statsBox: {
        backgroundColor: theme.semanticColors.bodyBackground,
        boxShadow: theme.effects.elevation4,
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        height: "150px",
        justifyContent: "center",
        padding: "0 10px 0 20px"
      },
      verticalAxis: {
        height: "auto",
        position: "relative",
        top: "0px",
        width: "64px"
      }
    });
  };
