// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IProcessedStyleSet, mergeStyleSets, IStyle } from "@fluentui/react";
import { flexLgDown, fullLgDown } from "@responsible-ai/core-ui";

export interface ICounterfactualChartStyles {
  chartWithAxes: IStyle;
  chartWithLegend: IStyle;
  chartWithVertical: IStyle;
  horizontalAxis: IStyle;
  horizontalAxisWithPadding: IStyle;
  mainChartContainer: IStyle;
  legendAndText: IStyle;
  legendLabel: IStyle;
  lowerChartContainer: IStyle;
  rotatedVerticalBox: IStyle;
  verticalAxis: IStyle;
  buttonStyle: IStyle;
}

export const counterfactualChartStyles: () => IProcessedStyleSet<ICounterfactualChartStyles> =
  () => {
    return mergeStyleSets<ICounterfactualChartStyles>({
      buttonStyle: {
        marginBottom: "10px",
        marginTop: "10px",
        paddingBottom: "10px",
        paddingTop: "10px"
      },
      chartWithAxes: {
        ...fullLgDown,
        paddingTop: "30px",
        width: "80%"
      },
      chartWithLegend: flexLgDown,
      chartWithVertical: {
        width: "100%"
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
      legendAndText: {
        boxSizing: "border-box",
        height: "100%",
        paddingLeft: "10px",
        paddingRight: "10px"
      },
      legendLabel: {
        paddingBottom: "10px",
        paddingTop: "10px"
      },
      lowerChartContainer: {
        height: "100%",
        paddingTop: "50px"
      },
      mainChartContainer: {
        width: "90%"
      },
      rotatedVerticalBox: {
        marginLeft: "28px",
        position: "absolute",
        textAlign: "center",
        top: "50%",
        transform: "translateX(-50%) translateY(-50%) rotate(270deg)",
        width: "max-content"
      },
      verticalAxis: {
        height: "auto",
        position: "relative",
        top: "0px",
        width: "67px"
      }
    });
  };
