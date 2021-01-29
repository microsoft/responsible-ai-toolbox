// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  IStyle,
  mergeStyleSets,
  IProcessedStyleSet,
  getTheme,
  mergeStyles
} from "office-ui-fabric-react";

export interface ITreeLegendStyles {
  cohortName: IStyle;
  errorRateCell: IStyle;
  errorCoverageCell: IStyle;
  metricBarBlack: IStyle;
  metricBarRed: IStyle;
  smallHeader: IStyle;
  treeLegend: IStyle;
  valueRed: IStyle;
  valueBlack: IStyle;
}

export const treeLegendStyles: () => IProcessedStyleSet<
  ITreeLegendStyles
> = () => {
  const theme = getTheme();
  const value: IStyle = {
    fontSize: "14px",
    fontWeight: "700",
    transform: "translate(0px, 14px)"
  };
  const metricBar: IStyle = {
    height: "25px",
    marginTop: "14px",
    transform: "translate(-10px, -10px)",
    width: "4px"
  };
  return mergeStyleSets<ITreeLegendStyles>({
    cohortName: {
      fontSize: "14px",
      fontWeight: "500",
      transform: "translate(10px, 10px)"
    },
    errorCoverageCell: {
      transform: "translate(20px, 30px)"
    },
    errorRateCell: {
      transform: "translate(110px, 30px)"
    },
    metricBarBlack: mergeStyles(metricBar, {
      fill: theme.palette.black
    }),
    metricBarRed: mergeStyles(metricBar, {
      fill: theme.palette.red
    }),
    smallHeader: {
      fontSize: "10px",
      fontWeight: "500"
    },
    treeLegend: {
      padding: "10px"
    },
    valueBlack: mergeStyles(value, {
      color: theme.palette.black
    }),
    valueRed: mergeStyles(value, {
      color: theme.palette.red
    })
  });
};
