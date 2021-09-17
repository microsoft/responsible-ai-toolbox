// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  IStyle,
  mergeStyleSets,
  IProcessedStyleSet
} from "office-ui-fabric-react";

export interface IMatrixFooterStyles {
  matrixCellPivot1Categories: IStyle;
  matrixCellPivot2Categories: IStyle;
  matrixRow: IStyle;
}

export const matrixFooterStyles: () => IProcessedStyleSet<IMatrixFooterStyles> =
  () => {
    return mergeStyleSets<IMatrixFooterStyles>({
      matrixCellPivot1Categories: {
        alignItems: "center",
        border: "none",
        display: "flex",
        fontSize: "12px",
        justifyContent: "flex-end",
        lineHeight: "16px",
        margin: "2px",
        overflow: "hidden",
        paddingLeft: "2px",
        paddingRight: "10px",
        width: "180px"
      },
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
