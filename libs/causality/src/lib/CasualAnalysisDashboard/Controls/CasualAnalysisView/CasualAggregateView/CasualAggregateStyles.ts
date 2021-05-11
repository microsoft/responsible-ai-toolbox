// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  IProcessedStyleSet,
  IStyle,
  mergeStyleSets
} from "office-ui-fabric-react";

export interface ICasualAggregateStyles {
  container: IStyle;
  description: IStyle;
  label: IStyle;
  lasso: IStyle;
  table: IStyle;
  leftPane: IStyle;
  rightPane: IStyle;
}

export const CasualAggregateStyles: () => IProcessedStyleSet<
  ICasualAggregateStyles
> = () => {
  return mergeStyleSets<ICasualAggregateStyles>({
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
    rightPane: {
      width: "25%"
    },
    table: {
      width: "50%"
    }
  });
};
