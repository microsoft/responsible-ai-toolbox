// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { HierarchyPointNode } from "d3-hierarchy";
import { IProcessedStyleSet } from "office-ui-fabric-react";
import React from "react";
import { CSSTransition } from "react-transition-group";

import { isColorDark } from "../../ColorPalette";
import { ITreeNode } from "../../TreeViewState";
import { FilterTooltip } from "../FilterTooltip/FilterTooltip";

import {
  ITreeViewRendererStyles,
  treeViewRendererStyles
} from "./TreeViewRenderer.styles";

export interface ITreeViewNodeProps {
  node: HierarchyPointNode<ITreeNode>;
  onSelect(node: HierarchyPointNode<ITreeNode>): void;
}

export interface ITreeViewNodeState {
  isMouseOver: boolean;
}
export class TreeViewNode extends React.Component<
  ITreeViewNodeProps,
  ITreeViewNodeState
> {
  public constructor(props: ITreeViewNodeProps) {
    super(props);
    this.state = {
      isMouseOver: false
    };
  }
  public render(): React.ReactNode {
    const { node } = this.props;
    const classNames = treeViewRendererStyles();
    return (
      <CSSTransition in={true} timeout={200} className="nodes">
        <g
          style={node.data.nodeState.style}
          onClick={this.onSelect}
          onMouseEnter={this.onMouseEnter}
          onMouseLeave={this.onMouseLeave}
          pointerEvents="all"
        >
          <circle
            r={node.data.r}
            className={classNames.node}
            style={node.data.nodeState.errorStyle}
          />
          {node.data.nodeState.onSelectedPath && (
            <circle
              r={node.data.r * 1.4}
              className={
                node.data.nodeState.isSelectedLeaf
                  ? classNames.clickedNodeFull
                  : classNames.clickedNodeDashed
              }
            />
          )}
          <g
            style={node.data.fillstyleDown}
            mask="url(#Mask)"
            className={classNames.nopointer}
          >
            <circle r="26" style={node.data.fillstyleUp} />
          </g>
          <text
            textAnchor="middle"
            className={this.getNodeClassName(
              classNames,
              node.data.filterProps.errorCoverage,
              node.data.errorColor.fill
            )}
          >
            {node.data.error}/{node.data.size}
          </text>
          <FilterTooltip
            key={node.id + "tooltip"}
            filterProps={node.data.filterProps}
            isMouseOver={this.state.isMouseOver}
          />
        </g>
      </CSSTransition>
    );
  }

  private onSelect = (): void => {
    this.props.onSelect(this.props.node);
  };

  private onMouseEnter = (): void => {
    this.setState({ isMouseOver: true });
  };

  private onMouseLeave = (): void => {
    this.setState({ isMouseOver: false });
  };

  private getNodeClassName(
    classNames: IProcessedStyleSet<ITreeViewRendererStyles>,
    ratio: number,
    fill: string
  ): string {
    let nodeTextClassName = classNames.nodeText;
    if (ratio > 50 && isColorDark(fill)) {
      nodeTextClassName = classNames.filledNodeText;
    }
    return nodeTextClassName;
  }
}
