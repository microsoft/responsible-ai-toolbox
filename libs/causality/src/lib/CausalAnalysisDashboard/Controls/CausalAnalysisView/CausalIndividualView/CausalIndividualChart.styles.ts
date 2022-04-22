// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  IProcessedStyleSet,
  mergeStyleSets,
  IStyle
} from "office-ui-fabric-react";

export interface ICausalIndividualChartStyles {
  legendAndText: IStyle;
  chartWithAxes: IStyle;
  chartWithVertical: IStyle;
  verticalAxis: IStyle;
  rotatedVerticalBox: IStyle;
  horizontalAxisWithPadding: IStyle;
  horizontalAxis: IStyle;
  individualChartContainer: IStyle;
}

export const causalIndividualChartStyles: () => IProcessedStyleSet<ICausalIndividualChartStyles> =
  () => {
    const legendWidth = "400px";
    return mergeStyleSets<ICausalIndividualChartStyles>({
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
