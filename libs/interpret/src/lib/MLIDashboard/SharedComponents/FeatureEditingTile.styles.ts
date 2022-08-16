// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IStyle, mergeStyleSets, IProcessedStyleSet } from "@fluentui/react";

export interface IFeatureEditingTileStyles {
  tile: IStyle;
  tileLabel: IStyle;
  edited: IStyle;
  error: IStyle;
}

export const featureEditingTileStyles: IProcessedStyleSet<IFeatureEditingTileStyles> =
  mergeStyleSets<IFeatureEditingTileStyles>({
    edited: {
      border: "2px solid #0078d4",
      borderRadius: "5px",
      padding: "3px"
    },
    error: {
      border: "2px solid #a80000",
      borderRadius: "5px",
      padding: "3px"
    },
    tile: {
      backgroundColor: "whitesmoke",
      boxShadow: "0 0 15px -2px #ccc",
      boxSizing: "border-box",
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
      margin: "15px",
      minHeight: "120px",
      padding: "5px",
      width: "200px"
    },
    tileLabel: {
      fontSize: "20px",
      overflowWrap: "break-word",
      padding: "3px 4px 15px 4px"
    }
  });
