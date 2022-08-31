// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IStyle, mergeStyleSets, IProcessedStyleSet } from "@fluentui/react";
import { hideXlDown } from "@responsible-ai/core-ui";

import { metricStyles, textStyles } from "../../Styles/CommonStyles.styles";

export interface ITreeLegendStyles {
  button: IStyle;
  metric: IStyle;
  metricBarBlack: IStyle;
  metricBarGreen: IStyle;
  metricBarRed: IStyle;
  node: IStyle;
  nopointer: IStyle;
  opacityToggleCircle: IStyle;
  smallHeader: IStyle;
  treeLegend: IStyle;
  valueBlack: IStyle;
}

export const treeLegendStyles: () => IProcessedStyleSet<ITreeLegendStyles> =
  () => {
    const commonMetricStyles = metricStyles();
    const commonTextStyles = textStyles();
    return mergeStyleSets<ITreeLegendStyles>({
      button: {
        maxWidth: "136px",
        ...hideXlDown
      },
      metric: hideXlDown,
      metricBarBlack: commonMetricStyles.metricBarBlack,
      metricBarGreen: commonMetricStyles.metricBarGreen,
      metricBarRed: commonMetricStyles.metricBarRed,
      node: {
        cursor: "default",
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
      smallHeader: commonTextStyles.smallHeader,
      treeLegend: {
        width: "15em"
      },
      valueBlack: commonMetricStyles.valueBlack
    });
  };
