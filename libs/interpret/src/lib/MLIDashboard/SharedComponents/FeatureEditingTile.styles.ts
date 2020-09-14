// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  IStyle,
  mergeStyleSets,
  IProcessedStyleSet
} from "office-ui-fabric-react";

export interface IFeatureEditingTileStyles {
  tile: IStyle;
  tileLabel: IStyle;
  edited: IStyle;
  error: IStyle;
}

export const featureEditingTileStyles: IProcessedStyleSet<IFeatureEditingTileStyles> = mergeStyleSets<
  IFeatureEditingTileStyles
>({
  tile: {
    backgroundColor: "whitesmoke",
    margin: "15px",
    width: "200px",
    minHeight: "120px",
    boxSizing: "border-box",
    boxShadow: "0 0 15px -2px #ccc",
    padding: "5px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between"
  },
  tileLabel: {
    fontFamily: `"Segoe UI", "Segoe UI Web (West European)", "Segoe UI",
          -apple-system, BlinkMacSystemFont, Roboto, "Helvetica Neue", sans-serif`,
    overflowWrap: "break-word",
    fontSize: "20px",
    padding: "3px 4px 15px 4px"
  },
  edited: {
    border: "2px solid #0078d4",
    padding: "3px",
    borderRadius: "5px"
  },
  error: {
    border: "2px solid #a80000",
    padding: "3px",
    borderRadius: "5px"
  }
});
