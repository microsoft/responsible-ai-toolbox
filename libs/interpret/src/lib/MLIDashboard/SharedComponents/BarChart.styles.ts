// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  IStyle,
  mergeStyleSets,
  IProcessedStyleSet
} from "office-ui-fabric-react";

export interface IBarChartStyles {
  barChart: IStyle;
  centered: IStyle;
}

export const barChartStyles: IProcessedStyleSet<IBarChartStyles> =
  mergeStyleSets<IBarChartStyles>({
    barChart: {
      flex: 1,
      width: "100%"
    },
    centered: {
      margin: "auto"
    }
  });
