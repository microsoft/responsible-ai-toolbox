// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IStyle, mergeStyleSets, IProcessedStyleSet } from "@fluentui/react";

export interface IAccessibleChartStyles {
  chart: IStyle;
  noData: IStyle;
  plotlyTable: IStyle;
}

export const accessibleChartStyles: IProcessedStyleSet<IAccessibleChartStyles> =
  mergeStyleSets<IAccessibleChartStyles>({
    chart: {
      height: "100%",
      width: "100%"
    },
    noData: {
      "text-align": "center"
    },
    plotlyTable: {
      border: "0",
      clip: "rect(0 0 0 0)",
      display: "block",
      height: "1px",
      margin: "-1px",
      overflow: "hidden",
      padding: "0",
      position: "absolute",
      width: "1px"
    }
  });
