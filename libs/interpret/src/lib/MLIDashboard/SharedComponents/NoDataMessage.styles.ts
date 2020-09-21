// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  IStyle,
  mergeStyleSets,
  IProcessedStyleSet
} from "office-ui-fabric-react";

export interface INoDataMessageStyles {
  centered: IStyle;
  primaryMessage: IStyle;
  secondaryMessage: IStyle;
}

export const noDataMessageStyles: IProcessedStyleSet<INoDataMessageStyles> = mergeStyleSets<
  INoDataMessageStyles
>({
  centered: {
    fontFamily: `"Segoe UI", "Segoe UI Web (West European)", "Segoe UI",
      -apple-system, BlinkMacSystemFont, Roboto, "Helvetica Neue", sans-serif`,
    margin: "auto",
    padding: "40px"
  },
  primaryMessage: {
    fontSize: "20px"
  },
  secondaryMessage: {
    fontSize: "16px"
  }
});
