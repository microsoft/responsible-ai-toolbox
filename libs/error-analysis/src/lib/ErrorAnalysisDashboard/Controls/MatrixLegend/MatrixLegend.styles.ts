// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  IStyle,
  mergeStyleSets,
  IProcessedStyleSet,
  getTheme,
  mergeStyles
} from "office-ui-fabric-react";

export interface IMatrixLegendStyles {
  matrixLegend: IStyle;
  metricBarBlack: IStyle;
  metricBarRed: IStyle;
  smallHeader: IStyle;
  valueRed: IStyle;
  valueBlack: IStyle;
}

export const matrixLegendStyles: () => IProcessedStyleSet<
  IMatrixLegendStyles
> = () => {
  const theme = getTheme();
  const value: IStyle = {
    fontSize: "28px",
    fontWeight: "600"
  };
  const metricBar: IStyle = {
    height: "50px",
    marginTop: "14px",
    width: "5px"
  };
  return mergeStyleSets<IMatrixLegendStyles>({
    matrixLegend: {
      padding: "10px"
    },
    metricBarBlack: mergeStyles(metricBar, {
      backgroundColor: theme.palette.black
    }),
    metricBarRed: mergeStyles(metricBar, {
      backgroundColor: theme.palette.red
    }),
    smallHeader: {
      fontSize: "15px",
      fontWeight: "500"
    },
    valueBlack: mergeStyles(value, {
      color: theme.palette.black,
      fontSize: "28px",
      fontWeight: "600"
    }),
    valueRed: mergeStyles(value, {
      color: theme.palette.red,
      fontSize: "28px",
      fontWeight: "600"
    })
  });
};
