// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IStyle, mergeStyleSets, IProcessedStyleSet } from "@fluentui/react";

export interface IFeatureRowCategoriesStyles {
  matrixCellPivot1Categories: IStyle;
  matrixCol: IStyle;
  matrixRow: IStyle;
}

export const featureRowCategoriesStyles: () => IProcessedStyleSet<IFeatureRowCategoriesStyles> =
  () => {
    return mergeStyleSets<IFeatureRowCategoriesStyles>({
      matrixCellPivot1Categories: {
        alignItems: "center",
        border: "none",
        display: "flex",
        fontSize: "12px",
        justifyContent: "flex-end",
        lineHeight: "16px",
        margin: "2px",
        maxWidth: "180px",
        minWidth: "20px",
        overflow: "hidden",
        paddingLeft: "2px"
      },
      matrixCol: {
        display: "flex",
        flexDirection: "column",
        fontStyle: "normal",
        fontWeight: "normal"
      },
      matrixRow: {
        display: "flex",
        flexDirection: "row",
        fontStyle: "normal",
        fontWeight: "normal",
        height: "50px"
      }
    });
  };
