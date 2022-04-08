// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  IProcessedStyleSet,
  IStyle,
  mergeStyleSets
} from "office-ui-fabric-react";

export interface ICausalAggregateStyles {
  callout: IStyle;
  container: IStyle;
  description: IStyle;
  label: IStyle;
  header: IStyle;
  lasso: IStyle;
  table: IStyle;
  leftPane: IStyle;
  rightPane: IStyle;
}

export const CausalAggregateStyles: () => IProcessedStyleSet<ICausalAggregateStyles> =
  () => {
    return mergeStyleSets<ICausalAggregateStyles>({
      callout: {
        margin: "-5px 0 0 -15px"
      },
      container: {
        height: "100%"
      },
      description: {
        display: "flex",
        justifyContent: "space-between",
        padding: "10px"
      },
      header: {
        fontSize: 14,
        fontWeight: "600",
        textAlign: "left"
      },
      label: {
        display: "inline-block",
        flex: "1",
        fontSize: 14,
        paddingBottom: "5px",
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
        padding: "10px",
        width: "70%"
      },
      rightPane: {
        width: "25%"
      },
      table: {
        width: "70%"
      }
    });
  };
