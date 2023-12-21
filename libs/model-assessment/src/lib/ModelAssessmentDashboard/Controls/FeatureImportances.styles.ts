// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  IStyle,
  mergeStyleSets,
  IProcessedStyleSet,
  getTheme
} from "@fluentui/react";

export interface IFeatureImportanceStyles {
  container: IStyle;
  header: IStyle;
  tabs: IStyle;
}

export const featureImportanceTabStyles: () => IProcessedStyleSet<IFeatureImportanceStyles> =
  () => {
    const theme = getTheme();
    return mergeStyleSets<IFeatureImportanceStyles>({
      container: {
        color: theme.semanticColors.bodyText
      },
      header: {
        padding: "16px 24px 16px 40px"
      },
      tabs: {
        justifyContent: "start",
        padding: "0px 30px",
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
