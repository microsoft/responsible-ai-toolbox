// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  IProcessedStyleSet,
  IStyle,
  mergeStyleSets
} from "office-ui-fabric-react";

export interface ITreatmentTableStyles {
  cell: IStyle;
  description: IStyle;
  detailsList: IStyle;
  detailsListDescription: IStyle;
  header: IStyle;
  spinButton: IStyle;
  spinButtonText: IStyle;
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
    description: {
      paddingTop: "110px"
    },
    detailsList: {
      width: "75%"
    },
    detailsListDescription: {
      fontSize: "14px",
      fontStyle: "normal",
      fontWeight: "normal",
      paddingTop: "50px"
    },
    header: {
      fontFamily: "Segoe UI",
      fontSize: "14px",
      fontWeight: "25px",
      lineHeight: "16px"
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
    spinButton: {
      paddingLeft: "10px",
      width: "10px"
    },
    spinButtonText: {
      paddingTop: "5px",
      verticalAlign: "bottom"
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
