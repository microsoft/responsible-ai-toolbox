// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  IStyle,
  mergeStyleSets,
  IProcessedStyleSet
} from "office-ui-fabric-react";

import { metricStyles, textStyles } from "../../../Styles/CommonStyles.styles";

export interface IMatrixLegendStyles {
  matrixLegend: IStyle;
  metricBarBlack: IStyle;
  metricBarGreen: IStyle;
  metricBarRed: IStyle;
  smallHeader: IStyle;
  valueBlack: IStyle;
}

export const matrixLegendStyles: () => IProcessedStyleSet<IMatrixLegendStyles> =
  () => {
    const commonMetricStyles = metricStyles();
    const commonTextStyles = textStyles();
    return mergeStyleSets<IMatrixLegendStyles>({
      matrixLegend: {
        padding: "10px"
      },
      metricBarBlack: commonMetricStyles.metricBarBlack,
      metricBarGreen: commonMetricStyles.metricBarGreen,
      metricBarRed: commonMetricStyles.metricBarRed,
      smallHeader: commonTextStyles.smallHeader,
      valueBlack: commonMetricStyles.valueBlack
    });
  };
