// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { getTheme } from "@fluentui/react";
import { getRandomId, SVGToolTip } from "@responsible-ai/core-ui";
import React from "react";

import { ColorPalette } from "../../ColorPalette";
import { IHierarchyPointNode as HierarchyPointNode } from "../../Interfaces/IHierarchyPointNode";
import { FilterTooltip } from "../FilterTooltip/FilterTooltip";

import { treeViewRendererStyles } from "./TreeViewRenderer.styles";
import { ITreeNode } from "./TreeViewState";
import { getNodeText, treeNodeAriaLabel } from "./TreeViewUtils";

export interface ITreeViewNodeProps {
  disabledView: boolean;
  fillOffset: number;
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
    const ariaLabel = treeNodeAriaLabel(node, this.props.disabledView);
    let strokeWidth = 1.5;
    if (this.props.node.data.nodeState.onSelectedPath) {
      if (node.data.nodeState.isSelectedLeaf) {
        strokeWidth = 6;
      } else {
        strokeWidth = 3;
      }
    }
    return (
      <>
        <g
          onFocus={this.onSelect}
          style={node.data.nodeState.style}
          onClick={this.onSelect}
          pointerEvents="all"
          ref={this.ref}
          tabIndex={0}
          aria-label={ariaLabel}
          className={classNames.treeNodeOutline}
        >
          <linearGradient id={gradientFillId} x1="0.5" y1="1" x2="0.5" y2="0">
            <stop
              offset="0%"
              stopOpacity="1"
              stopColor={this.props.node.data.errorColor}
            />
            <stop
              offset={`${this.props.fillOffset * 100}%`}
              stopOpacity="1"
              stopColor={this.props.node.data.errorColor}
            />
            <stop
              offset={`${this.props.fillOffset * 100}%`}
              stopOpacity="1"
              stopColor={ColorPalette.NodeFilledColor}
            />
            <stop
              offset="100%"
              stopOpacity="1"
              stopColor={ColorPalette.NodeFilledColor}
            />
          </linearGradient>
          <circle
            r={node.data.r}
            className={
              this.props.disabledView
                ? classNames.nodeDisabled
                : classNames.node
            }
            style={{
              color: "black",
              stroke: this.props.node.data.nodeState.onSelectedPath
                ? theme.semanticColors.link
                : ColorPalette.NodeOutlineColor,
              strokeDasharray:
                this.props.node.data.nodeState.onSelectedPath &&
                !node.data.nodeState.isSelectedLeaf
                  ? "6, 6"
                  : "",
              strokeWidth
            }}
            fill={`url(#${gradientFillId})`}
          />
          <rect
            x={-22}
            y={-10.5}
            width={45}
            height={20}
            style={{ fill: ColorPalette.white }}
            rx={10}
            ry={10}
          />
          <text
            textAnchor="middle"
            className={classNames.nodeText}
            dominantBaseline="middle"
          >
            {getNodeText(node)}
          </text>
        </g>
        {!this.props.disabledView && (
          <SVGToolTip target={this.ref} spacing={15}>
            <FilterTooltip
              key={`${node.id}tooltip`}
              filterProps={node.data.filterProps}
            />
          </SVGToolTip>
        )}
      </>
    );
  }

  private onSelect = (): void => {
    this.props.onSelect(this.props.node);
  };
}
