// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { FabricStyles } from "@responsible-ai/core-ui";
import {
  IStyle,
  mergeStyleSets,
  IProcessedStyleSet,
  getTheme
} from "office-ui-fabric-react";

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
  smallItalic: IStyle;
}

export const datasetExplorerTabStyles: () => IProcessedStyleSet<IDatasetExplorerTabStyles> =
  () => {
    const theme = getTheme();
    return mergeStyleSets<IDatasetExplorerTabStyles>({
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
      chart: {
        flexGrow: "1"
      },
      chartEditorButton: [
        FabricStyles.chartEditorButton,
        {
          position: "absolute",
          right: "10px",
          zIndex: 10
        }
      ],
      chartWithAxes: {
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        flexGrow: "1",
        paddingRight: "10px",
        paddingTop: "30px"
      },
      chartWithVertical: {
        display: "flex",
        flexDirection: "row",
        flexGrow: "1",
        position: "relative"
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
      colorBox: {
        borderRadius: "6px",
        cursor: "pointer",
        display: "inline-block",
        height: "12px",
        margin: "11px 4px 11px 8px",
        width: "12px"
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
      legend: {},
      legendAndText: {
        height: "100%",
        width: "195px"
      },
      legendItem: {
        alignItems: "center",
        display: "flex",
        flexDirection: "row",
        height: "28px"
      },
      legendLabel: {
        display: "inline-block",
        flex: "1"
      },
      mainArea: {
        display: "flex",
        flexDirection: "row",
        height: "600px",
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
      rotatedVerticalBox: {
        marginLeft: "28px",
        position: "absolute",
        textAlign: "center",
        top: "50%",
        transform: "translateX(-50%) translateY(-50%) rotate(270deg)",
        width: "max-content"
      },
      smallItalic: [FabricStyles.placeholderItalic],
      verticalAxis: {
        height: "auto",
        position: "relative",
        top: "0px",
        width: "64px"
      }
    });
  };
