// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { SVGToolTip } from "@responsible-ai/core-ui";
import { HierarchyPointNode } from "d3-hierarchy";
import { IProcessedStyleSet } from "office-ui-fabric-react";
import React from "react";

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

export class TreeViewNode extends React.Component<ITreeViewNodeProps> {
  private ref: React.RefObject<SVGGElement>;
  public constructor(props: ITreeViewNodeProps) {
    super(props);
    this.state = {
      isMouseOver: false
    };
    this.ref = React.createRef<SVGGElement>();
  }
  public render(): React.ReactNode {
    const { node } = this.props;
    const classNames = treeViewRendererStyles();
    return (
      <>
        <g
          style={node.data.nodeState.style}
          onClick={this.onSelect}
          pointerEvents="all"
          ref={this.ref}
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
        </g>
        <SVGToolTip target={this.ref} spacing={15}>
          <FilterTooltip
            key={node.id + "tooltip"}
            filterProps={node.data.filterProps}
          />
        </SVGToolTip>
      </>
    );
  }

  private onSelect = (): void => {
    this.props.onSelect(this.props.node);
  };

  private getNodeClassName(
    classNames: IProcessedStyleSet<ITreeViewRendererStyles>,
    ratio: number,
    fill: string | undefined
  ): string {
    let nodeTextClassName = classNames.nodeText;
    if (ratio > 50 && isColorDark(fill)) {
      nodeTextClassName = classNames.filledNodeText;
    }
    return nodeTextClassName;
  }
}
