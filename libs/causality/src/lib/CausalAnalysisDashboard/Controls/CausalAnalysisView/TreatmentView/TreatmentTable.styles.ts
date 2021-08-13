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
  chartContainer: IStyle;
}

export const TreatmentTableStyles: () => IProcessedStyleSet<ITreatmentTableStyles> =
  () => {
    return mergeStyleSets<ITreatmentTableStyles>({
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
        borderCollapse: "collapse",
        "td, th": {
          border: "1px",
          borderStyle: "solid"
        },
        textAlign: "center",
        width: "50vw"
      }
    });
  };
