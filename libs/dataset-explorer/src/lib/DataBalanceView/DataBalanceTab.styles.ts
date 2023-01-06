// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  IStyle,
  mergeStyleSets,
  IProcessedStyleSet,
  getTheme
} from "@fluentui/react";

export interface IDataBalanceTabStyles {
  boldText: IStyle;
  dropdownLongWidth: IStyle;
  dropdownMedWidth: IStyle;
  page: IStyle;
}

export const dataBalanceTabStyles: () => IProcessedStyleSet<IDataBalanceTabStyles> =
  () => {
    const theme = getTheme();
    return mergeStyleSets<IDataBalanceTabStyles>({
      boldText: {
        fontWeight: 600
      },
      dropdownLongWidth: {
        dropdown: { width: 200 }
      },
      dropdownMedWidth: {
        dropdown: { width: 150 }
      },
      page: {
        color: theme.semanticColors.bodyText,
        height: "100%",
        padding: "0 40px 10px 40px",
        width: "100%"
      }
    });
  };
