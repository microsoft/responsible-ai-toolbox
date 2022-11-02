// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IStyle, mergeStyleSets, IProcessedStyleSet } from "@fluentui/react";
import { flexMdDown } from "@responsible-ai/core-ui";

import { metricStyles, textStyles } from "../../../Styles/CommonStyles.styles";

export interface IMatrixLegendStyles {
  matrixLegend: IStyle;
  metricBarBlack: IStyle;
  metricBarGreen: IStyle;
  metricBarRed: IStyle;
  smallHeader: IStyle;
  valueBlack: IStyle;
  metricLegendStack: IStyle;
}

export const matrixLegendStyles: () => IProcessedStyleSet<IMatrixLegendStyles> =
  () => {
    const commonMetricStyles = metricStyles();
    const commonTextStyles = textStyles();
    return mergeStyleSets<IMatrixLegendStyles>({
      matrixLegend: {
        marginTop: "0px !important",
        padding: "0 10px 10px 10px"
      },
      metricBarBlack: commonMetricStyles.metricBarBlack,
      metricBarGreen: commonMetricStyles.metricBarGreen,
      metricBarRed: commonMetricStyles.metricBarRed,
      metricLegendStack: flexMdDown,
      smallHeader: commonTextStyles.smallHeader,
      valueBlack: commonMetricStyles.valueBlack
    });
  };
