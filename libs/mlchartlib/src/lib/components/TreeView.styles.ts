// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  IStyle,
  mergeStyleSets,
  IProcessedStyleSet
} from "office-ui-fabric-react";

export interface ITreeViewStyles {
  ul: IStyle;
  node: IStyle;
  path: IStyle;
}

export const treeViewStyles: IProcessedStyleSet<ITreeViewStyles> = mergeStyleSets<
  ITreeViewStyles
>({
  node: {
    alignItems: "center",
    backgroundColor: "dodgerblue",
    borderColor: "dodgerblue",
    borderRadius: "50%",
    display: "flex",
    height: "2em",
    justifyContent: "center",
    padding: "1em",
    position: "relative",
    width: "2em"
  },
  path: {
    alignItems: "center",
    backgroundColor: "dodgerblue",
    borderColor: "dodgerblue",
    borderRadius: "1em",
    display: "flex",
    height: "2em",
    justifyContent: "center",
    marginBottom: "2em",
    padding: "1em",
    position: "relative",
    width: "2em"
  },
  ul: {
    display: "inline-flex",
    margin: 0,
    padding: 0
  }
});
