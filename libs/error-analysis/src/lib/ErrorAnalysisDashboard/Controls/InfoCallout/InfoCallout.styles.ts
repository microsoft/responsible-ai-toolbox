// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  IStyle,
  mergeStyleSets,
  IProcessedStyleSet
} from "office-ui-fabric-react";

export interface IInfoCalloutStyles {
  calloutInfo: IStyle;
}

export const infoCalloutStyles: () => IProcessedStyleSet<IInfoCalloutStyles> =
  () => {
    return mergeStyleSets<IInfoCalloutStyles>({
      calloutInfo: {
        display: "flex",
        flexDirection: "column",
        fontFamily: `"Segoe UI", "Segoe UI Web (West European)", "Segoe UI",
      -apple-system, BlinkMacSystemFont, Roboto, "Helvetica Neue", sans-serif`,
        maxWidth: "300px",
        padding: "10px"
      }
    });
  };
