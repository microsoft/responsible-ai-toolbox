// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IStyle, mergeStyleSets, IProcessedStyleSet } from "@fluentui/react";

export interface IInfoCalloutStyles {
  calloutInfo: IStyle;
}

export const infoCalloutStyles: () => IProcessedStyleSet<IInfoCalloutStyles> =
  () => {
    return mergeStyleSets<IInfoCalloutStyles>({
      calloutInfo: {
        display: "flex",
        flexDirection: "column",
        maxWidth: "300px",
        padding: "10px"
      }
    });
  };
