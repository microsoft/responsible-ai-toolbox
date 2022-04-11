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
  boldText: IStyle;
  callout: IStyle;
  colorBox: IStyle;
  chartContainer: IStyle;
  chartEditorButton: IStyle;
  chartWithAxes: IStyle;
  chartWithVertical: IStyle;
  cohortDropdown: IStyle;
  cohortPickerWrapper: IStyle;
  cohortPickerLabel: IStyle;
  verticalAxis: IStyle;
  rotatedVerticalBox: IStyle;
  legendAndText: IStyle;
  horizontalAxisWithPadding: IStyle;
  paddingDiv: IStyle;
  horizontalAxis: IStyle;
  page: IStyle;
  infoIcon: IStyle;
  helperText: IStyle;
  infoWithText: IStyle;
  individualChartContainer: IStyle;
  mainArea: IStyle;
  legendLabel: IStyle;
  legendItem: IStyle;
  smallItalic: IStyle;
  sidePanel: IStyle;
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
        padding: "10px 20px",
        width: "200px"
      },
      chartContainer: {
        height: "100%",
        width: "90%"
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
        height: "100%",
        paddingRight: "10px",
        width: "85%"
      },
      chartWithVertical: {
        width: "100%"
      },
      cohortDropdown: {
        width: "170px"
      },
      cohortPickerLabel: {
        fontWeight: "600",
        paddingRight: "8px"
      },
      cohortPickerWrapper: {
        alignItems: "center",
        height: "32px",
        padding: "0 0 0 33px"
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
        textAlign: "center"
      },
      horizontalAxisWithPadding: {
        paddingBottom: "20px"
      },
      individualChartContainer: {
        width: "90%"
      },
      infoIcon: {
        fontSize: "23px",
        height: "23px",
        width: "23px"
      },
      infoWithText: {
        maxWidth: "750px",
        paddingLeft: "33px",
        width: "100%"
      },
      legendAndText: {
        height: "100%",
        width: "195px"
      },
      legendItem: {
        alignItems: "center",
        height: "28px"
      },
      legendLabel: {
        display: "inline-block"
      },
      mainArea: {
        height: "100%",
        width: "100%"
      },
      paddingDiv: {
        width: "50px"
      },
      page: {
        color: theme.semanticColors.bodyText,
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
      sidePanel: {
        width: "15%"
      },
      smallItalic: [FabricStyles.placeholderItalic],
      verticalAxis: {
        height: "auto",
        position: "relative",
        top: "0px",
        width: "65px"
      }
    });
  };
