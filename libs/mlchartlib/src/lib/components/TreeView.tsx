// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Property } from "csstype";
import React from "react";

import { treeViewStyles } from "./TreeView.styles";
import { TreeViewNode } from "./TreeViewNode";

export interface ITreeViewProps {
  rootNode: Omit<ITreeNode, "textOnPath" | "pathThickness">;
  nodeStyle?: INodeStyle;
  selectedNodeStyle?: INodeStyle;
}
interface ITreeViewState {
  nodeSelected: ITreeNode | undefined;
}

export interface ITreeNode {
  text: string;
  /**
   * The text shows on the path to this node.
   */
  textOnPath?: string;
  /**
   * Amount of fill, 1 for fully filled color
   */
  fillAmount?: number;
  pathThickness?: number;
  children?: ITreeNode[];
}

export interface INodeStyle {
  borderColor?: Property.Color;
  backgroundColor?: Property.Color;
  fillColor?: Property.Color;
  textColor?: Property.Color;
  pathColor?: Property.Color;
}

export class TreeView extends React.Component<ITreeViewProps, ITreeViewState> {
  public render(): React.ReactNode {
    return (
      <div className="tf-tree tf-custom">
        <ul className={treeViewStyles.ul}>
          <TreeViewNode node={this.props.rootNode} />
        </ul>
      </div>
    );
  }
}
