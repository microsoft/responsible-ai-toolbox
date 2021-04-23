// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { ITreeNode, INodeStyle } from "@responsible-ai/mlchartlib";
import React from "react";

import { treeViewStyles } from "./TreeView.styles";

export interface ITreeViewNodeProps {
  node: ITreeNode;
  nodeStyle?: INodeStyle;
  selectedNodeStyle?: INodeStyle;
}

export class TreeViewNode extends React.Component<ITreeViewNodeProps> {
  public render(): React.ReactNode {
    return (
      <li>
        {this.props.node.textOnPath && (
          <span className={`${treeViewStyles.path} tf-nc tf-path`}>
            <text>{this.props.node.textOnPath}</text>
          </span>
        )}
        <span className={`${treeViewStyles.node} tf-nc`}>
          <text>{this.props.node.text}</text>
        </span>
        {this.props.node.children && (
          <ul className={treeViewStyles.ul}>
            {this.props.node.children.map((c, i) => (
              <TreeViewNode node={c} key={i} />
            ))}
          </ul>
        )}
      </li>
    );
  }
}
