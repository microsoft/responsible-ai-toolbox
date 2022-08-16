// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IStyle, mergeStyleSets, IProcessedStyleSet } from "@fluentui/react";

export interface INoDataMessageStyles {
  centered: IStyle;
  primaryMessage: IStyle;
  secondaryMessage: IStyle;
}

export const noDataMessageStyles: IProcessedStyleSet<INoDataMessageStyles> =
  mergeStyleSets<INoDataMessageStyles>({
    centered: {
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
