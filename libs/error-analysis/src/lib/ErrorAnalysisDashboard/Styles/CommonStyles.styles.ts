// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  IStyle,
  mergeStyleSets,
  IProcessedStyleSet,
  getTheme,
  mergeStyles
} from "@fluentui/react";

import { ColorPalette } from "../ColorPalette";

export interface IMetricStyles {
  metricBarBlack: IStyle;
  metricBarRed: IStyle;
  metricBarGreen: IStyle;
  valueBlack: IStyle;
}

export interface ITextStyles {
  smallHeader: IStyle;
}

export const metricStyles: () => IProcessedStyleSet<IMetricStyles> = () => {
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
  return mergeStyleSets<IMetricStyles>({
    metricBarBlack: mergeStyles(metricBar, {
      backgroundColor: theme.palette.black
    }),
    metricBarGreen: mergeStyles(metricBar, {
      backgroundColor: ColorPalette.MaxMetricColor
    }),
    metricBarRed: mergeStyles(metricBar, {
      backgroundColor: ColorPalette.MaxErrorColor
    }),
    valueBlack: mergeStyles(value, {
      color: theme.palette.black,
      fontSize: "28px",
      fontWeight: "600"
    })
  });
};

export const textStyles: () => IProcessedStyleSet<ITextStyles> = () => {
  return mergeStyleSets<ITextStyles>({
    smallHeader: {
      fontSize: "15px",
      fontWeight: "500",
      pointerEvents: "auto"
    }
  });
};
