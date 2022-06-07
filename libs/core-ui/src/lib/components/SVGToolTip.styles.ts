// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  IStyle,
  mergeStyleSets,
  IProcessedStyleSet,
  getTheme
} from "@fluentui/react";

export interface ISVGToolTipStyles {
  tooltipRect: IStyle;
}

export const SVGToolTipStyles: () => IProcessedStyleSet<ISVGToolTipStyles> =
  () => {
    const theme = getTheme();
    return mergeStyleSets<ISVGToolTipStyles>({
      tooltipRect: {
        outline: "1px solid ",
        outlineColor: theme.palette.themeLighterAlt
      }
    });
  };
