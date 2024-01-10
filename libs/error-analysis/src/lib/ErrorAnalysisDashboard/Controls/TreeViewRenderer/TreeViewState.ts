// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  IErrorAnalysisData,
  IErrorAnalysisTreeNode,
  Metrics
} from "@responsible-ai/core-ui";
import { Property } from "csstype";

import { FilterProps } from "../../FilterProps";
import { IHierarchyPointNode as HierarchyPointNode } from "../../Interfaces/IHierarchyPointNode";

export interface IErrorColorStyle {
  fill: string | undefined;
}

export interface IShowSelectedStyle {
  opacity: number;
}

export interface ITransform {
  transform: string;
}

export interface INodeDetail {
  errorColor: Property.Color;
  maskDown: ITransform;
  maskUp: ITransform;
}

export interface ITreeViewRendererState {
  request?: AbortController;
  nodeDetail: INodeDetail;
  selectedNode: any;
  hoverPathId: string | undefined;
  transform: any;
  treeNodes: any[];
  root?: HierarchyPointNode<ITreeNode>;
  rootSize: any;
  rootErrorSize: any;
  rootLocalError: any;
  isErrorMetric: boolean;
  maxDepth: number;
  numLeaves: number;
  minChildSamples: number;
  metric: string;
}

// Represents IRequestNode with augmented calculations
export interface ITreeNode extends IErrorAnalysisTreeNode {
  rootErrorSize: number;
  errorColor: Property.Color;
  filterProps: FilterProps;
  maskShift: number;
  r: number;
  nodeState: INodeState;
}

export interface IFillStyleUp {
  transform: string;
  fill: string;
}

// Contains node state that changes with UI clicks
export interface INodeState {
  onSelectedPath: boolean;
  isSelectedLeaf: boolean;
  style: ITransform | undefined;
}

export function createInitialTreeViewState(
  errorAnalysisData: IErrorAnalysisData | undefined
): ITreeViewRendererState {
  return {
    hoverPathId: undefined,
    isErrorMetric: true,
    maxDepth: errorAnalysisData?.maxDepth ?? 4,
    metric: errorAnalysisData?.metric ?? Metrics.ErrorRate,
    minChildSamples: errorAnalysisData?.minChildSamples ?? 20,
    nodeDetail: {
      errorColor: "#eaeaea",
      maskDown: {
        transform: "translate(0px, -13px)"
      },
      maskUp: {
        transform: "translate(0px, 13px)"
      }
    },
    numLeaves: errorAnalysisData?.numLeaves ?? 31,
    request: undefined,
    root: undefined,
    rootErrorSize: 0,
    rootLocalError: 0,
    rootSize: 0,
    selectedNode: undefined,
    transform: undefined,
    treeNodes: []
  };
}
