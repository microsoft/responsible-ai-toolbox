// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  IProcessedStyleSet,
  mergeStyleSets,
  IStyle,
  getTheme
} from "office-ui-fabric-react";

export interface ICounterfactualListStyle {
  dropdownLabel: IStyle;
  originalCell: IStyle;
  editCell: IStyle;
}

export const counterfactualListStyle: () => IProcessedStyleSet<ICounterfactualListStyle> =
  () => {
    const theme = getTheme();
    return mergeStyleSets<ICounterfactualListStyle>({
      dropdownLabel: {
        color: theme.palette.black,
        fontSize: "14px",
        marginTop: "5px",
        span: {
          fontWeight: "600"
        }
      },
      editCell: {
        color: theme.palette.green,
        fontWeight: "bold"
      },
      originalCell: {
        color: theme.semanticColors.bodyText
      }
    });
  };
