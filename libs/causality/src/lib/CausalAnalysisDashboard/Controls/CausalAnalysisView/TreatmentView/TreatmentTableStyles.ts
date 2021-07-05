// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  IProcessedStyleSet,
  IStyle,
  mergeStyleSets
} from "office-ui-fabric-react";

export interface ITreatmentTableStyles {
  cell: IStyle;
  table: IStyle;
  label: IStyle;
}

export const TreatmentTableStyles: () => IProcessedStyleSet<
  ITreatmentTableStyles
> = () => {
  return mergeStyleSets<ITreatmentTableStyles>({
    cell: {
      borderStyle: "groove",
      fontFamily: "Segoe UI",
      fontSize: "14px",
      fontStyle: "normal",
      fontWeight: "normal",
      height: "100px",
      minWidth: "250px",
      textAlign: "center"
    },
    label: {
      display: "inline-block",
      flex: "1",
      fontSize: 14,
      lineHeight: 14,
      paddingBottom: "10px",
      paddingLeft: "30px",
      textAlign: "left"
    },
    table: {
      border: "2px solid",
      fontFamily: "Segoe UI",
      fontSize: "14px",
      fontStyle: "normal",
      fontWeight: "normal",
      textAlign: "center",
      width: "100%"
    }
  });
};
