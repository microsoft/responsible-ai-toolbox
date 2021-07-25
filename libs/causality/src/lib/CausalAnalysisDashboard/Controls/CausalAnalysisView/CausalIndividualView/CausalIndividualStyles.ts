// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  IProcessedStyleSet,
  IStyle,
  mergeStyleSets
} from "office-ui-fabric-react";

export interface ICausalIndividualStyles {
  aggregateChart: IStyle;
  container: IStyle;
  description: IStyle;
  header: IStyle;
  label: IStyle;
  lasso: IStyle;
  individualTable: IStyle;
}

export const CausalIndividualStyles: () => IProcessedStyleSet<ICausalIndividualStyles> =
  () => {
    return mergeStyleSets<ICausalIndividualStyles>({
      aggregateChart: {
        display: "flex",
        height: "100%"
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
        fontWeight: "600"
      },
      individualTable: {
        width: "70%"
      },
      label: {
        display: "inline-block",
        flex: "1",
        fontSize: 14,
        textAlign: "left"
      },
      lasso: {
        display: "inline-block",
        flex: "1",
        fontSize: 14,
        paddingTop: "25px",
        textAlign: "left"
      }
    });
  };
