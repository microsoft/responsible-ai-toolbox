// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  IProcessedStyleSet,
  mergeStyleSets,
  IStyle
} from "office-ui-fabric-react";

export interface ICounterfactualPanelStyles {
  listContainer: IStyle;
  pane: IStyle;
  cPanel: IStyle;
  container: IStyle;
  button: IStyle;
}

export const counterfactualPanelStyles: () => IProcessedStyleSet<
  ICounterfactualPanelStyles
> = () => {
  return mergeStyleSets<ICounterfactualPanelStyles>({
    button: {
      marginTop: "20px",
      minWidth: "150px",
      verticalAlign: "center"
    },
    container: {
      width: "100%"
    },
    cPanel: {
      float: "left",
      width: "100%"
    },
    listContainer: {
      border: "1px solid red",
      float: "left",
      position: "relative",
      width: "100%"
    },
    pane: {
      border: "1px solid",
      width: "150px"
    }
  });
};
