// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  IProcessedStyleSet,
  IStyle,
  mergeStyleSets
} from "office-ui-fabric-react";

export interface ITreatmentStyles {
  container: IStyle;
  listContainer: IStyle;
  description: IStyle;
  label: IStyle;
  lasso: IStyle;
  table: IStyle;
  header: IStyle;
  leftPane: IStyle;
  rightPane: IStyle;
  cell: IStyle;
}

export const TreatmentStyles: () => IProcessedStyleSet<ITreatmentStyles> =
  () => {
    return mergeStyleSets<ITreatmentStyles>({
      cell: {
        borderStyle: "solid",
        textAlign: "center",
        width: "100%"
      },
      container: {
        display: "flex",
        flex: 1,
        flexDirection: "row"
      },
      description: {
        display: "flex",
        justifyContent: "space-between",
        padding: "10px"
      },
      header: {
        fontSize: 14,
        margin: "20px",
        textAlign: "left"
      },
      label: {
        display: "inline-block",
        flex: "1",
        fontSize: 14,
        textAlign: "left"
      },
      lasso: {
        cursor: "pointer",
        display: "inline-block",
        flex: "1",
        fontSize: 14,
        paddingTop: "25px",
        textAlign: "left"
      },
      leftPane: {
        height: "100%",
        padding: "10px",
        width: "70%"
      },
      listContainer: {
        maxHeight: "65%",
        overflowY: "scroll"
      },
      rightPane: {
        width: "25%"
      },
      table: {
        width: "70%"
      }
    });
  };
