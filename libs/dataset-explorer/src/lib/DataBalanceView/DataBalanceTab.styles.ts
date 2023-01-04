// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  IStyle,
  mergeStyleSets,
  IProcessedStyleSet,
  getTheme
} from "@fluentui/react";
import { descriptionMaxWidth } from "@responsible-ai/core-ui";

export interface IDataBalanceTabStyles {
  boldText: IStyle;
  callout: IStyle;
  dropdownLongWidth: IStyle;
  dropdownMedWidth: IStyle;
  infoWithText: IStyle;
  page: IStyle;
}

export const dataBalanceTabStyles: () => IProcessedStyleSet<IDataBalanceTabStyles> =
  () => {
    const theme = getTheme();
    return mergeStyleSets<IDataBalanceTabStyles>({
      boldText: {
        fontWeight: 600
      },
      callout: {
        margin: "-18px 0 0 0"
      },
      dropdownLongWidth: {
        dropdown: { width: 200 }
      },
      dropdownMedWidth: {
        dropdown: { width: 150 }
      },
      infoWithText: {
        maxWidth: descriptionMaxWidth,
        width: "100%"
      },
      page: {
        color: theme.semanticColors.bodyText,
        height: "100%",
        padding: "0 40px 40px 40px",
        width: "100%"
      }
    });
  };
