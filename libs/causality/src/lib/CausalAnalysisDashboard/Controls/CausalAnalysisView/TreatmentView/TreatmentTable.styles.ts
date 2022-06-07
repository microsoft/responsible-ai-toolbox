// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  IProcessedStyleSet,
  IStyle,
  mergeStyleSets
} from "office-ui-fabric-react";

export interface ITreatmentTableStyles {
  description: IStyle;
  detailsList: IStyle;
  detailsListDescription: IStyle;
  dropdown: IStyle;
  spinButton: IStyle;
  spinButtonText: IStyle;
  table: IStyle;
  label: IStyle;
  leftTable: IStyle;
  tableDescription: IStyle;
  treatmentBarContainer: IStyle;
}

export const TreatmentTableStyles: () => IProcessedStyleSet<ITreatmentTableStyles> =
  () => {
    return mergeStyleSets<ITreatmentTableStyles>({
      description: {
        padding: "10px 20px 0 0",
        width: "20%"
      },
      detailsList: {
        width: "80%"
      },
      detailsListDescription: {
        fontSize: "14px",
        fontStyle: "normal",
        fontWeight: "normal",
        marginLeft: "0px !important",
        padding: "50px 20px 0 0"
      },
      dropdown: {
        width: "220px"
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
      leftTable: {
        width: "80%"
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
        "td, th": {
          border: "1px",
          borderStyle: "solid"
        },
        textAlign: "center"
      },
      tableDescription: { width: "20%" },
      treatmentBarContainer: {
        height: "100%",
        width: "80%"
      }
    });
  };
