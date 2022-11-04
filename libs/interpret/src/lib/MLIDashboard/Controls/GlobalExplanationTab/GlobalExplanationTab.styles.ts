// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IStyle, mergeStyleSets, IProcessedStyleSet } from "@fluentui/react";
import {
  descriptionMaxWidth,
  flexLgDown,
  fullLgDown,
  hideXlDown
} from "@responsible-ai/core-ui";

export interface IGlobalTabStyles {
  chartCallout: IStyle;
  chartContainer: IStyle;
  chartLeftPart: IStyle;
  page: IStyle;
  globalChartControls: IStyle;
  globalChartWithLegend: IStyle;
  helperText: IStyle;
  infoIcon: IStyle;
  infoWithText: IStyle;
  legendAndSort: IStyle;
  legendHelpText: IStyle;
  sliderLabel: IStyle;
  secondaryChartAndLegend: IStyle;
  startingK: IStyle;
  topK: IStyle;
  rightJustifiedContainer: IStyle;
  dependencePlotChartContainer: IStyle;
}

export const globalTabStyles: () => IProcessedStyleSet<IGlobalTabStyles> =
  () => {
    const rightMarginWidth = "200px";
    return mergeStyleSets<IGlobalTabStyles>({
      chartCallout: {
        boxSizing: "border-box",
        display: "inline-flex",
        flexDirection: "row",
        justifyContent: "flex-end",
        width: "80%"
      },
      chartContainer: {
        paddingLeft: "25px",
        width: "100%",
        ...flexLgDown
      },
      chartLeftPart: {
        width: "80%",
        ...fullLgDown
      },
      dependencePlotChartContainer: {
        marginBottom: "20px",
        ...flexLgDown,
        paddingLeft: "25px",
        width: "100%"
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
        maxWidth: descriptionMaxWidth,
        paddingLeft: "25px",
        width: "100%",
        ...hideXlDown
      },
      legendAndSort: {
        "@media screen and (min-width: 479px)": {
          paddingLeft: "25px",
          paddingTop: "55px",
          width: rightMarginWidth
        },
        height: "100%"
      },
      legendHelpText: {
        fontWeight: "300"
      },
      page: {
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
        height: "100%",
        paddingLeft: "25px",
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
        padding: "10px 0 0 25px",
        width: "70%"
      }
    });
  };
