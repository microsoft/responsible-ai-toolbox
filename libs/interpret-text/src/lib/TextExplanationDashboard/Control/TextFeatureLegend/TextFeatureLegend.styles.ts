// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  IStyle,
  mergeStyleSets,
  IProcessedStyleSet,
  getTheme
} from "@fluentui/react";

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
        backgroundColor: theme.semanticColors.link,
        color: theme.semanticColors.bodyBackground
      },
      posFeatureImportance: {
        backgroundColor: theme.semanticColors.errorText,
        color: theme.semanticColors.bodyBackground
      }
    });
  };
