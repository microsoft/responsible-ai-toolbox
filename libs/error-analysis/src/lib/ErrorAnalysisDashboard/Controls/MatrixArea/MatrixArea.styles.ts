// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  IStyle,
  mergeStyleSets,
  IProcessedStyleSet
} from "office-ui-fabric-react";

export interface IMatrixAreaStyles {
  matrixLabelBottom: IStyle;
  matrixLabelTab: IStyle;
  emptyLabelPadding: IStyle;
  matrixLabel: IStyle;
  matrixCell: IStyle;
  matrixCellPivot1Categories: IStyle;
  matrixCellPivot2Categories: IStyle;
  matrixRow: IStyle;
  matrixArea: IStyle;
  nanMatrixCell: IStyle;
  styledMatrixCell: IStyle;
  selectedMatrixCell: IStyle;
}

export const matrixAreaStyles: () => IProcessedStyleSet<
  IMatrixAreaStyles
> = () => {
  return mergeStyleSets<IMatrixAreaStyles>({
    emptyLabelPadding: {
      paddingTop: "60px"
    },
    matrixArea: {
      display: "flex",
      flexDirection: "row",
      paddingBottom: "50px",
      paddingTop: "10px"
    },
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
    matrixCellPivot2Categories: {
      alignItems: "center",
      border: "none",
      display: "flex",
      fontSize: "12px",
      justifyContent: "center",
      lineHeight: "16px",
      margin: "2px",
      maxWidth: "60px",
      minWidth: "60px",
      overflow: "hidden"
    },
    matrixLabel: {
      paddingLeft: "20px"
    },
    matrixLabelBottom: {
      display: "flex",
      flexDirection: "row",
      fontFamily: "Segoe UI",
      fontSize: "14px",
      fontStyle: "normal",
      fontWeight: "normal",
      justifyContent: "center",
      paddingBottom: "20px",
      paddingTop: "20px"
    },
    matrixLabelTab: {
      width: "150px"
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
