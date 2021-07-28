// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  IStyle,
  mergeStyleSets,
  IProcessedStyleSet
} from "office-ui-fabric-react";

export interface IMatrixAreaStyles {
  emptyLabelPadding: IStyle;
  matrixLabelBottom: IStyle;
  matrixLabelTab: IStyle;
  matrixLabel: IStyle;
  matrixArea: IStyle;
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
    }
  });
};
