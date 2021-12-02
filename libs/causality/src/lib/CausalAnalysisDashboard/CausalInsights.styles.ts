// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  IStyle,
  mergeStyleSets,
  IProcessedStyleSet,
  getTheme
} from "office-ui-fabric-react";

export interface ICausalInsightsStyles {
  container: IStyle;
}

export const causalInsightsStyles: () => IProcessedStyleSet<ICausalInsightsStyles> =
  () => {
    const theme = getTheme();
    return mergeStyleSets<ICausalInsightsStyles>({
      container: {
        color: theme.semanticColors.bodyText
      }
    });
  };
