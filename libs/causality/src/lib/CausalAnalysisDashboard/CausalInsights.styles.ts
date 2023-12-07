// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  IStyle,
  mergeStyleSets,
  IProcessedStyleSet,
  getTheme
} from "@fluentui/react";

export interface ICausalInsightsStyles {
  container: IStyle;
  tabs: IStyle;
}

export const causalInsightsStyles: () => IProcessedStyleSet<ICausalInsightsStyles> =
  () => {
    const theme = getTheme();
    return mergeStyleSets<ICausalInsightsStyles>({
      container: {
        color: theme.semanticColors.bodyText,
        padding: "0 40px 10px 40px"
      },
      tabs: {
        selectors: {
          "[role='tablist'].ms-Pivot": {
            display: "flex",
            flexWrap: "wrap",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap"
          }
        }
      }
    });
  };
