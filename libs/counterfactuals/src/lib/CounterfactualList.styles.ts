// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  IProcessedStyleSet,
  mergeStyleSets,
  IStyle,
  getTheme
} from "@fluentui/react";

export interface ICounterfactualListStyle {
  bottomRowText: IStyle;
  dropdownLabel: IStyle;
  editCell: IStyle;
  highlightRow: IStyle;
  originalCell: IStyle;
}

export const counterfactualListStyle: () => IProcessedStyleSet<ICounterfactualListStyle> =
  () => {
    const theme = getTheme();
    return mergeStyleSets<ICounterfactualListStyle>({
      bottomRowText: {
        fontWeight: "bold"
      },
      dropdownLabel: {
        color: theme.palette.black,
        fontSize: "14px",
        marginTop: "5px",
        span: {
          fontWeight: "600"
        }
      },
      editCell: {
        color: theme.semanticColors.bodyText,
        fontWeight: "bold"
      },
      highlightRow: {
        backgroundColor: theme.semanticColors.bodyBackgroundHovered
      },
      originalCell: {
        color: theme.semanticColors.bodyText
      }
    });
  };
