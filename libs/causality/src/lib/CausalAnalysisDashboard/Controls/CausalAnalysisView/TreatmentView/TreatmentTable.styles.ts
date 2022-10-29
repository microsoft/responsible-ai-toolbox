// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IProcessedStyleSet, IStyle, mergeStyleSets } from "@fluentui/react";
import { flexLgDown, fullLgDown } from "@responsible-ai/core-ui";

export interface ITreatmentTableStyles {
  description: IStyle;
  detailsList: IStyle;
  detailsListDescription: IStyle;
  dropdown: IStyle;
  spinButton: IStyle;
  spinButtonText: IStyle;
  table: IStyle;
  tableWrapper: IStyle;
  label: IStyle;
  leftTable: IStyle;
  tableDescription: IStyle;
  treatmentBarContainer: IStyle;
  treatmentBarChart: IStyle;
  treatmentList: IStyle;
  spinButtonAndText: IStyle;
}

export const TreatmentTableStyles: () => IProcessedStyleSet<ITreatmentTableStyles> =
  () => {
    return mergeStyleSets<ITreatmentTableStyles>({
      description: {
        padding: "10px 20px 0 0",
        width: "20%",
        ...fullLgDown
      },
      detailsList: {
        width: "80%",
        ...fullLgDown
      },
      detailsListDescription: {
        fontSize: "14px",
        fontStyle: "normal",
        fontWeight: "normal",
        marginLeft: "0px !important",
        padding: "50px 20px 0 0"
      },
      dropdown: {
        selectors: {
          "@media screen and (min-width: 1024px)": {
            width: "220px"
          }
        }
      },
      label: {
        display: "inline-block",
        flex: "1",
        fontSize: 14,
        lineHeight: 14,
        paddingBottom: "10px",
        selectors: {
          "@media screen and (min-width: 1024px)": {
            paddingLeft: "30px"
          }
        },
        textAlign: "left"
      },
      leftTable: {
        width: "80%"
      },
      spinButton: {
        paddingLeft: "10px",
        width: "10px"
      },
      spinButtonAndText: flexLgDown,
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
      tableDescription: { ...fullLgDown, width: "20%" },
      tableWrapper: {
        ...flexLgDown,
        selectors: {
          "@media screen and (max-width: 1023px)": {
            overflowX: "auto",
            paddingLeft: "0"
          },
          "@media screen and (min-width: 1024px)": {
            flexFlow: "nowrap"
          }
        }
      },
      treatmentBarChart: flexLgDown,
      treatmentBarContainer: {
        height: "100%",
        width: "80%",
        ...fullLgDown
      },
      treatmentList: flexLgDown
    });
  };
