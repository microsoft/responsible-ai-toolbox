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
  dropdown: IStyle;
  header: IStyle;
  spinButton: IStyle;
  spinButtonText: IStyle;
  singleCell: IStyle;
  table: IStyle;
  tableInner: IStyle;
  td: IStyle;
  label: IStyle;
  chartContainer: IStyle;
}

export const TreatmentTableStyles: () => IProcessedStyleSet<ITreatmentTableStyles> =
  () => {
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
      chartContainer: {
        minHeight: "500px"
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
      dropdown: {
        paddingLeft: "20px",
        width: "220px"
      },
      header: {
        fontFamily: "Segoe UI",
        fontSize: "14px",
        fontWeight: "600",
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
      singleCell: {
        border: "1px",
        borderStyle: "solid",
        width: "30vw"
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
        borderCollapse: "collapse",
        fontFamily: "Segoe UI",
        fontSize: "14px",
        fontStyle: "normal",
        fontWeight: "normal",
        textAlign: "center",
        width: "50vw"
      },
      tableInner: {
        borderCollapse: "collapse",
        fontFamily: "Segoe UI",
        fontSize: "14px",
        fontStyle: "normal",
        fontWeight: "normal",
        textAlign: "center",
        width: "100%"
      },
      td: {
        border: "1px solid #dddddd",
        padding: "0",
        textAlign: "center"
      }
    });
  };
