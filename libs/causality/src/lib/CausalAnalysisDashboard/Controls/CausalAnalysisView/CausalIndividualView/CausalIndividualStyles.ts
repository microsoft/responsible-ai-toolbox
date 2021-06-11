// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  IProcessedStyleSet,
  IStyle,
  mergeStyleSets
} from "office-ui-fabric-react";

export interface ICausalIndividualStyles {
  container: IStyle;
  description: IStyle;
  label: IStyle;
  lasso: IStyle;
  individualTable: IStyle;
  individualChart: IStyle;
}

export const CausalIndividualStyles: () => IProcessedStyleSet<
  ICausalIndividualStyles
> = () => {
  return mergeStyleSets<ICausalIndividualStyles>({
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
    individualChart: {
      backgroundColor: "red"
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
