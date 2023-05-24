// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  IStyle,
  mergeStyleSets,
  IProcessedStyleSet,
  getTheme
} from "@fluentui/react";
import {
  descriptionMaxWidth,
  flexLgDown,
  FluentUIStyles,
  fullLgDown,
  hideXlDown
} from "@responsible-ai/core-ui";

export interface IDatasetExplorerTabStyles {
  chartContainer: IStyle;
  chartEditorButton: IStyle;
  chartWithAxes: IStyle;
  chartWithVertical: IStyle;
  cohortDropdown: IStyle;
  cohortPickerWrapper: IStyle;
  cohortPicker: IStyle;
  cohortPickerLabel: IStyle;
  colorBox: IStyle;
  colorValue: IStyle;
  verticalAxis: IStyle;
  rotatedVerticalBox: IStyle;
  legendAndText: IStyle;
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
  chartAndType: IStyle;
  chart: IStyle;
  buttonStyle: IStyle;
}

export const datasetExplorerTabStyles: () => IProcessedStyleSet<IDatasetExplorerTabStyles> =
  () => {
    const theme = getTheme();
    return mergeStyleSets<IDatasetExplorerTabStyles>({
      buttonStyle: {
        marginBottom: "10px",
        marginTop: "20px",
        paddingBottom: "10px",
        paddingTop: "10px"
      },
      chart: {
        backgroundColor: theme.semanticColors.bodyBackground,
        marginBottom: "40px",
        width: "85%"
      },
      chartAndType: flexLgDown,
      chartContainer: {
        height: "100%",
        width: "90%"
      },
      chartEditorButton: [
        FluentUIStyles.chartEditorButton,
        {
          position: "absolute",
          right: "10px",
          zIndex: 10
        }
      ],
      chartWithAxes: {
        height: "100%",
        paddingRight: "10px"
      },
      chartWithVertical: {
        width: "100%"
      },
      cohortDropdown: {
        width: "170px"
      },
      cohortPicker: flexLgDown,
      cohortPickerLabel: {
        fontWeight: "600",
        paddingRight: "8px"
      },
      cohortPickerWrapper: {
        alignItems: "center",
        height: "32px"
      },
      colorBox: {
        borderRadius: "6px",
        cursor: "pointer",
        display: "inline-block",
        height: "12px",
        margin: "11px 4px 11px 8px",
        width: "12px"
      },
      colorValue: {
        padding: "12px 0px"
      },
      helperText: {
        paddingLeft: "15px",
        paddingRight: "160px"
      },
      horizontalAxis: {
        textAlign: "center"
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
        maxWidth: descriptionMaxWidth,
        width: "100%",
        ...hideXlDown
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
        selectors: {
          "@media screen and (max-width: 479px)": {
            marginTop: "60px !important"
          }
        },
        width: "100%"
      },
      paddingDiv: {
        width: "50px"
      },
      page: {
        color: theme.semanticColors.bodyText,
        height: "100%",
        padding: "0 40px 32px 40px",
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
        width: "15%",
        ...fullLgDown
      },
      smallItalic: [FluentUIStyles.placeholderItalic],
      verticalAxis: {
        height: "auto",
        position: "relative",
        top: "0px",
        width: "65px"
      }
    });
  };
