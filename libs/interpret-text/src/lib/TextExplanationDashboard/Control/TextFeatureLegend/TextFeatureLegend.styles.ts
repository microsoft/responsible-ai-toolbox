// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  IStyle,
  mergeStyleSets,
  IProcessedStyleSet,
  getTheme
} from "@fluentui/react";
import {
  getPrimaryBackgroundChartColor,
  getPrimaryChartColor
} from "@responsible-ai/core-ui";

export interface ITextFeatureLegendStyles {
  legend: IStyle;
  negFeatureImportance: IStyle;
  posFeatureImportance: IStyle;
}

export const textFeatureLegendStyles: () => IProcessedStyleSet<ITextFeatureLegendStyles> =
  () => {
    const theme = getTheme();
    return mergeStyleSets<ITextFeatureLegendStyles>({
      legend: {
        color: theme.semanticColors.disabledText
      },
      negFeatureImportance: {
        color: getPrimaryChartColor(theme),
        textDecorationLine: "underline"
      },
      posFeatureImportance: {
        backgroundColor: getPrimaryChartColor(theme),
        color: getPrimaryBackgroundChartColor(theme)
      }
    });
  };
