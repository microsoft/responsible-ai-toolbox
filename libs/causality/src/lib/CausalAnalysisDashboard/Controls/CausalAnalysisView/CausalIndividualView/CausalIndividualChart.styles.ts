// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IProcessedStyleSet, mergeStyleSets, IStyle } from "@fluentui/react";
import { flexLgDown, fullLgDown } from "@responsible-ai/core-ui";

export interface ICausalIndividualChartStyles {
  legendAndText: IStyle;
  chart: IStyle;
  chartWithAxes: IStyle;
  chartWithVertical: IStyle;
  verticalAxis: IStyle;
  rotatedVerticalBox: IStyle;
  horizontalAxisWithPadding: IStyle;
  horizontalAxis: IStyle;
  individualChartContainer: IStyle;
  buttonStyle: IStyle;
}

export const causalIndividualChartStyles: () => IProcessedStyleSet<ICausalIndividualChartStyles> =
  () => {
    const legendWidth = "400px";
    return mergeStyleSets<ICausalIndividualChartStyles>({
      buttonStyle: {
        marginBottom: "10px",
        marginTop: "10px !important",
        paddingBottom: "10px",
        paddingTop: "10px",
        width: "200px"
      },
      chart: flexLgDown,
      chartWithAxes: {
        width: "80%",
        ...fullLgDown
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
      individualChartContainer: {
        width: "90%"
      },
      legendAndText: {
        boxSizing: "border-box",
        height: "100%",
        paddingLeft: "10px",
        paddingRight: "10px",
        width: legendWidth
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
