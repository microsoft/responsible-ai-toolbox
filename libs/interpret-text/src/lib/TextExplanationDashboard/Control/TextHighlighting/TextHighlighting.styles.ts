// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  IStyle,
  mergeStyles,
  mergeStyleSets,
  IProcessedStyleSet,
  getTheme
} from "@fluentui/react";
import { NeutralColors, SharedColors } from "@fluentui/theme";

export interface ITextHighlightingStyles {
  normal: IStyle;
  highlighted: IStyle;
  boldunderline: IStyle;
}

export const textHighlightingStyles: () => IProcessedStyleSet<ITextHighlightingStyles> =
  () => {
    const theme = getTheme();
    const normal = {
      color: theme.semanticColors.bodyText
    };
    return mergeStyleSets<ITextHighlightingStyles>({
      boldunderline: mergeStyles([
        normal,
        {
          color: SharedColors.blue10,
          fontSize: theme.fonts.large.fontSize,
          padding: 0,
          textDecorationLine: "underline"
        }
      ]),
      highlighted: mergeStyles([
        normal,
        {
          backgroundColor: SharedColors.blue10,
          color: NeutralColors.white
        }
      ]),
      normal
    });
  };
