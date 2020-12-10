// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  IStyle,
  mergeStyleSets,
  IProcessedStyleSet,
  getTheme,
  mergeStyles
} from "office-ui-fabric-react";

export interface IFilterTooltipStyles {
  filterTooltip: IStyle;
  hideFilterTooltip: IStyle;
  tooltipRect: IStyle;
  metricBarBlack: IStyle;
  metricBarRed: IStyle;
  showFilterTooltip: IStyle;
  smallHeader: IStyle;
  valueRed: IStyle;
  valueBlack: IStyle;
  errorRateCell: IStyle;
  errorCoverageCell: IStyle;
  numCorrect: IStyle;
  numIncorrect: IStyle;
}

export const filterTooltipStyles: () => IProcessedStyleSet<
  IFilterTooltipStyles
> = () => {
  const theme = getTheme();
  const value: IStyle = {
    fontSize: "12px",
    fontWeight: "700",
    transform: "translate(0px, 14px)"
  };
  const metricBar: IStyle = {
    height: "23px",
    marginTop: "14px",
    transform: "translate(-10px, -7px)",
    width: "4px"
  };
  return mergeStyleSets<IFilterTooltipStyles>({
    errorCoverageCell: {
      transform: "translate(20px, 45px)"
    },
    errorRateCell: {
      transform: "translate(20px, 75px)"
    },
    filterTooltip: {
      padding: "10px",
      pointerEvents: "none"
    },
    hideFilterTooltip: {
      visibility: "hidden"
    },
    metricBarBlack: mergeStyles(metricBar, {
      fill: theme.palette.black
    }),
    metricBarRed: mergeStyles(metricBar, {
      fill: theme.palette.red
    }),
    numCorrect: {
      fontSize: "8px",
      fontWeight: "500",
      transform: "translate(10px, 15px)"
    },
    numIncorrect: {
      fontSize: "8px",
      fontWeight: "500",
      transform: "translate(10px, 25px)"
    },
    showFilterTooltip: {
      visibility: "visible"
    },
    smallHeader: {
      fontSize: "8px",
      fontWeight: "500"
    },
    tooltipRect: {
      outline: "1px solid " + theme.palette.themeLighterAlt
    },
    valueBlack: mergeStyles(value, {
      color: theme.palette.black
    }),
    valueRed: mergeStyles(value, {
      color: theme.palette.red
    })
  });
};
