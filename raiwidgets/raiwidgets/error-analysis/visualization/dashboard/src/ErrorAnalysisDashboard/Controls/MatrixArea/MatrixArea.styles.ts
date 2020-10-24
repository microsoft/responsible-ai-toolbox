import {
  IStyle,
  mergeStyleSets,
  IProcessedStyleSet,
  getTheme
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
  styledMatrixCell: IStyle;
  selectedMatrixCell: IStyle;
}

export const matrixAreaStyles: () => IProcessedStyleSet<
  IMatrixAreaStyles
> = () => {
  const theme = getTheme();
  return mergeStyleSets<IMatrixAreaStyles>({
    matrixLabelBottom: {
      fontFamily: "Segoe UI",
      fontStyle: "normal",
      fontWeight: "normal",
      fontSize: "14px",
      display: "flex",
      flexDirection: "row",
      justifyContent: "center",
      paddingTop: "20px",
      paddingBottom: "20px"
    },
    matrixLabelTab: {
      width: "150px"
    },
    emptyLabelPadding: {
      paddingTop: "60px"
    },
    matrixLabel: {
      paddingLeft: "20px"
    },
    matrixCell: {
      margin: "2px",
      display: "flex",
      fontSize: "10px",
      border: "1px solid #bfbfbf",
      alignItems: "center",
      overflow: "hidden",
      minWidth: "60px",
      cursor: "pointer"
    },
    matrixCellPivot1Categories: {
      margin: "2px",
      display: "flex",
      fontSize: "12px",
      border: "none",
      alignItems: "center",
      overflow: "hidden",
      width: "180px",
      paddingLeft: "2px",
      paddingRight: "10px",
      lineHeight: "16px",
      justifyContent: "flex-end"
    },
    matrixCellPivot2Categories: {
      margin: "2px",
      display: "flex",
      fontSize: "12px",
      border: "none",
      alignItems: "center",
      overflow: "hidden",
      minWidth: "60px",
      maxWidth: "60px",
      lineHeight: "16px",
      justifyContent: "center"
    },
    matrixRow: {
      display: "flex",
      flexDirection: "row",
      height: "50px",
      fontFamily: "Segoe UI",
      fontStyle: "normal",
      fontWeight: "normal"
    },
    matrixArea: {
      display: "flex",
      flexDirection: "row",
      paddingTop: "10px",
      paddingBottom: "50px"
    },
    styledMatrixCell: {
      display: "flex",
      height: "100%",
      width: "100%",
      fontSize: "18px",
      lineHeight: "24px",
      alignItems: "center",
      justifyContent: "center",
      cursor: "pointer"
    },
    selectedMatrixCell: {
      display: "flex",
      border: "3px solid #089acc",
      alignItems: "center"
    }
  });
};
