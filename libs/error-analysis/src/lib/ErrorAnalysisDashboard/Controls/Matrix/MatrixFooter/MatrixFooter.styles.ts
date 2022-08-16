// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IStyle, mergeStyleSets, IProcessedStyleSet } from "@fluentui/react";

export interface IMatrixFooterStyles {
  matrixCellPivot2Categories: IStyle;
  matrixRow: IStyle;
}

export const matrixFooterStyles: () => IProcessedStyleSet<IMatrixFooterStyles> =
  () => {
    return mergeStyleSets<IMatrixFooterStyles>({
      matrixCellPivot2Categories: {
        alignItems: "center",
        border: "1px transparent solid",
        display: "flex",
        fontSize: "12px",
        justifyContent: "center",
        lineHeight: "16px",
        margin: "2px",
        maxWidth: "60px",
        minWidth: "60px",
        overflow: "hidden"
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
