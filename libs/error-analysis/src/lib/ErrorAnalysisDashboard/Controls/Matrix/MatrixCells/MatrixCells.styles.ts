// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IStyle, mergeStyleSets, IProcessedStyleSet } from "@fluentui/react";

export interface IMatrixCellsStyles {
  matrixCell: IStyle;
  matrixCol: IStyle;
  matrixRow: IStyle;
  nanErrorMatrixCell: IStyle;
  nanMetricMatrixCell: IStyle;
  selectedMatrixCell: IStyle;
  styledMatrixCell: IStyle;
}

export const matrixCellsStyles: () => IProcessedStyleSet<IMatrixCellsStyles> =
  () => {
    return mergeStyleSets<IMatrixCellsStyles>({
      matrixCell: {
        ":focus": {
          outline: "none"
        },
        alignItems: "center",
        border: "1px solid #bfbfbf",
        cursor: "pointer",
        display: "flex",
        fontSize: "10px",
        margin: "2px",
        minWidth: "60px",
        overflow: "visible"
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
      },
      nanErrorMatrixCell: {
        background:
          "repeating-linear-gradient(-45deg, white, white 5px, pink 10px, pink 20px)",
        color: "black"
      },
      nanMetricMatrixCell: {
        background:
          "repeating-linear-gradient(-45deg, white, white 5px, limegreen 10px, limegreen 20px)",
        color: "black"
      },
      selectedMatrixCell: {
        alignItems: "center",
        border: "3px solid #089acc",
        display: "flex"
      },
      styledMatrixCell: {
        ":focus": {
          outline: "none"
        },
        alignItems: "center",
        cursor: "pointer",
        display: "flex",
        fontSize: "18px",
        height: "100%",
        justifyContent: "center",
        lineHeight: "24px",
        width: "100%"
      }
    });
  };
