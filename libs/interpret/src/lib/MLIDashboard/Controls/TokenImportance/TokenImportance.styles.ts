// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IStyle, mergeStyleSets, IProcessedStyleSet } from "@fluentui/react";

export interface ILabelWithCalloutStyles {
  tokenLabel: IStyle;
  tokenLabelText: IStyle;
}

export const tokenImportanceStyles: () => IProcessedStyleSet<ILabelWithCalloutStyles> =
  () => {
    return mergeStyleSets<ILabelWithCalloutStyles>({
      tokenLabel: {
        display: "inline-flex",
        paddingTop: "10px"
      },
      tokenLabelText: {
        fontWeight: "600",
        paddingTop: "5px"
      }
    });
  };
