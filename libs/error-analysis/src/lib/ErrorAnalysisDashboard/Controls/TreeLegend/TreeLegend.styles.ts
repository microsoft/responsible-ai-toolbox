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
  metricBarBlack: IStyle;
  metricBarRed: IStyle;
  node: IStyle;
  nopointer: IStyle;
  opacityToggleCircle: IStyle;
  smallHeader: IStyle;
  treeLegend: IStyle;
  valueRed: IStyle;
  valueBlack: IStyle;
}

export const treeLegendStyles: () => IProcessedStyleSet<ITreeLegendStyles> =
  () => {
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
    return mergeStyleSets<ITreeLegendStyles>({
      metricBarBlack: mergeStyles(metricBar, {
        backgroundColor: theme.palette.black
      }),
      metricBarRed: mergeStyles(metricBar, {
        backgroundColor: theme.palette.red
      }),
      node: {
        ":hover": {
          strokeWidth: "3px"
        },
        cursor: "pointer",
        opacity: "1",
        stroke: "#089acc",
        strokeWidth: "0px"
      },
      nopointer: {
        pointerEvents: "none"
      },
      opacityToggleCircle: {
        transform: "translate(26px, 26px)"
      },
      smallHeader: {
        fontSize: "15px",
        fontWeight: "500",
        pointerEvents: "auto"
      },
      treeLegend: {
        width: "15em"
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
