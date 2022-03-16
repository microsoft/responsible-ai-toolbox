// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  IProcessedStyleSet,
  IStyle,
  mergeStyleSets
} from "office-ui-fabric-react";

export interface ICausalIndividualStyles {
  aggregateChart: IStyle;
  callout: IStyle;
  container: IStyle;
  description: IStyle;
  header: IStyle;
  lasso: IStyle;
  individualChart: IStyle;
  individualTable: IStyle;
}

export const CausalIndividualStyles: () => IProcessedStyleSet<ICausalIndividualStyles> =
  () => {
    return mergeStyleSets<ICausalIndividualStyles>({
      aggregateChart: {
        display: "flex",
        height: "100%"
      },
      callout: {
        margin: "-5px 0 0 -15px"
      },
      container: {
        display: "flex",
        flex: 1,
        flexDirection: "row"
      },
      description: {
        display: "inline-block",
        flex: "1",
        fontSize: 14,
        paddingBottom: "15px",
        textAlign: "left"
      },
      header: {
        fontSize: 14,
        fontWeight: "600",
        paddingTop: "70px"
      },
      individualChart: {
        width: "100%"
      },
      individualTable: {
        width: "70%"
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
