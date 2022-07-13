// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  IStyle,
  mergeStyles,
  mergeStyleSets,
  IProcessedStyleSet
} from "@fluentui/react";
import { NeutralColors, SharedColors } from "@fluentui/theme";

export interface ITextHighlightingStyles {
  normal: IStyle;
  highlighted: IStyle;
  boldunderline: IStyle;
}

export const textHighlightingStyles: () => IProcessedStyleSet<ITextHighlightingStyles> =
  () => {
    const normal = {
      fontFamily: "Segoe UI",
      fontSize: "1.5em"
    };
    return mergeStyleSets<ITextHighlightingStyles>({
      boldunderline: mergeStyles([
        normal,
        {
          color: SharedColors.blue10,
          fontWeight: "bold",
          textDecorationLine: "underline"
        }
      ]),
      highlighted: mergeStyles([
        normal,
        {
          backgroundColor: SharedColors.blue10,
          color: NeutralColors.white,
          fontweight: "400px"
        }
      ]),
      normal
    });
  };
