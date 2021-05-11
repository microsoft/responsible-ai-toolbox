// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { HierarchyPointNode } from "d3-hierarchy";

import { FilterProps } from "./FilterProps";

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
  showSelected: IShowSelectedStyle;
  globalError: string;
  localError: string;
  instanceInfo: string;
  errorInfo: string;
  successInfo: string;
  errorColor: IErrorColorStyle;
  maskDown: ITransform;
  maskUp: ITransform;
}

export interface ITreeViewRendererState {
  request?: AbortController;
  nodeDetail: INodeDetail;
  selectedNode: any;
  transform: any;
  treeNodes: any[];
  root?: HierarchyPointNode<ITreeNode>;
  rootSize: any;
  rootErrorSize: any;
  rootLocalError: any;
}

// Represents IRequestNode with augmented calculations
export interface ITreeNode {
  arg: number;
  condition: string;
  error: number;
  id: string;
  method: string;
  nodeIndex: number;
  nodeName: string;
  parentId: string;
  parentNodeName: string;
  pathFromRoot: string;
  size: number;
  sourceRowKeyHash: string;
  success: number;
  errorColor: IErrorColorStyle;
  fillstyleUp: IFillStyleUp;
  fillstyleDown: ITransform;
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
  errorStyle: Record<string, number | string | undefined> | undefined;
  onSelectedPath: boolean;
  isSelectedLeaf: boolean;
  style: ITransform | undefined;
}

export function createInitialTreeViewState(): ITreeViewRendererState {
  return {
    nodeDetail: {
      errorColor: {
        fill: "#eaeaea"
      },
      errorInfo: "0 Errors",
      globalError: "0",
      instanceInfo: "0 Instances",
      localError: "0",
      maskDown: {
        transform: "translate(0px, -13px)"
      },
      maskUp: {
        transform: "translate(0px, 13px)"
      },
      showSelected: { opacity: 0 },
      successInfo: "0 Success"
    },
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
