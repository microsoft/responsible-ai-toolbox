// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IProcessedStyleSet, IStyle, mergeStyleSets } from "@fluentui/react";
import { descriptionMaxWidth, hideXlDown } from "@responsible-ai/core-ui";

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
        ...hideXlDown,
        maxWidth: descriptionMaxWidth,
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
        maxHeight: "500px",
        minHeight: "250px",
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
