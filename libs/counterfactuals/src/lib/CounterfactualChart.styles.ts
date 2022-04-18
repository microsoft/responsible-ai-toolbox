// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  IProcessedStyleSet,
  mergeStyleSets,
  IStyle
} from "office-ui-fabric-react";

export interface ICounterfactualChartStyles {
  chartWithAxes: IStyle;
  chartWithVertical: IStyle;
  horizontalAxis: IStyle;
  horizontalAxisWithPadding: IStyle;
  mainChartContainer: IStyle;
  legendAndText: IStyle;
  legendLabel: IStyle;
  lowerChartContainer: IStyle;
  rotatedVerticalBox: IStyle;
  verticalAxis: IStyle;
}

export const counterfactualChartStyles: () => IProcessedStyleSet<ICounterfactualChartStyles> =
  () => {
    return mergeStyleSets<ICounterfactualChartStyles>({
      chartWithAxes: {
        paddingTop: "30px",
        width: "80%"
      },
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
