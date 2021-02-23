// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  IStyle,
  mergeStyleSets,
  IProcessedStyleSet
} from "office-ui-fabric-react";

export interface IMatrixCellsStyles {
  matrixCell: IStyle;
  matrixCellPivot1Categories: IStyle;
  matrixCol: IStyle;
  matrixRow: IStyle;
  nanMatrixCell: IStyle;
  selectedMatrixCell: IStyle;
  styledMatrixCell: IStyle;
}

export const matrixCellsStyles: () => IProcessedStyleSet<
  IMatrixCellsStyles
> = () => {
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
    matrixCol: {
      display: "flex",
      flexDirection: "column",
      fontFamily: "Segoe UI",
      fontStyle: "normal",
      fontWeight: "normal"
    },
    matrixRow: {
      display: "flex",
      flexDirection: "row",
      fontFamily: "Segoe UI",
      fontStyle: "normal",
      fontWeight: "normal",
      height: "50px"
    },
    nanMatrixCell: {
      background:
        "repeating-linear-gradient(-45deg, white, white 5px, pink 10px, pink 20px)",
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
