// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { getRandomId, SVGToolTip } from "@responsible-ai/core-ui";
import { HierarchyPointNode } from "d3-hierarchy";
import { getTheme, IProcessedStyleSet } from "office-ui-fabric-react";
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
    this.ref = React.createRef<SVGGElement>();
  }
  public render(): React.ReactNode {
    const { node } = this.props;
    const classNames = treeViewRendererStyles();
    const gradientFillId = getRandomId();
    const theme = getTheme();
    return (
      <>
        <g
          style={node.data.nodeState.style}
          onClick={this.onSelect}
          pointerEvents="all"
          ref={this.ref}
        >
          <linearGradient id={gradientFillId} x1="0.5" y1="1" x2="0.5" y2="0">
            <stop
              offset="0%"
              stopOpacity="1"
              stopColor={this.props.node.data.errorColor}
            />
            <stop
              offset={`${
                (this.props.node.data.error /
                  this.props.node.data.rootErrorSize) *
                100
              }%`}
              stopOpacity="1"
              stopColor={this.props.node.data.errorColor}
            />
            <stop
              offset={`${
                (this.props.node.data.error /
                  this.props.node.data.rootErrorSize) *
                100
              }%`}
              stopOpacity="1"
              stopColor={theme.semanticColors.bodyBackgroundChecked}
            />
            <stop
              offset="100%"
              stopOpacity="1"
              stopColor={theme.semanticColors.bodyBackgroundChecked}
            />
          </linearGradient>
          <circle
            r={node.data.r}
            className={classNames.node}
            style={{
              color: "black",
              stroke: this.props.node.data.nodeState.onSelectedPath
                ? theme.semanticColors.link
                : this.props.node.data.errorColor,
              strokeWidth: this.props.node.data.nodeState.onSelectedPath ? 3 : 2
            }}
            fill={`url(#${gradientFillId})`}
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
          <text
            textAnchor="middle"
            className={this.getNodeClassName(
              classNames,
              node.data.filterProps.errorCoverage,
              node.data.errorColor
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
