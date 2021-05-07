// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  IStyle,
  mergeStyleSets,
  IProcessedStyleSet,
  mergeStyles
} from "office-ui-fabric-react";

import { ColorPalette } from "../../ColorPalette";

export interface ITreeViewRendererStyles {
  clickedNodeDashed: IStyle;
  clickedNodeFull: IStyle;
  detailLines: IStyle;
  filledNodeText: IStyle;
  legend: IStyle;
  linkLabel: IStyle;
  linkLabelsTransitionGroup: IStyle;
  linksTransitionGroup: IStyle;
  node: IStyle;
  nodeText: IStyle;
  nodesGroup: IStyle;
  nopointer: IStyle;
  svgOuterFrame: IStyle;
  treeDescription: IStyle;
}

export const treeViewRendererStyles: () => IProcessedStyleSet<
  ITreeViewRendererStyles
> = () => {
  const detailStyle = {
    fill: "#777",
    font: "normal 12px Arial",
    fontFamily: "Arial, Helvetica, sans-serif",
    fontWeight: "bold",
    pointerEvents: "none",
    textAnchor: "middle"
  };
  const nodeTextStyle = {
    fontSize: "10px",
    fontWeight: "bolder",
    pointerEvents: "none",
    transform: "translate(0px, 0px)"
  };
  return mergeStyleSets<ITreeViewRendererStyles>({
    clickedNodeDashed: {
      fill: "none",
      stroke: "#0078D4",
      strokeDasharray: "3, 3",
      strokeWidth: 2
    },
    clickedNodeFull: {
      fill: "none",
      stroke: "#0078D4",
      strokeWidth: 2
    },
    detailLines: mergeStyles([
      detailStyle,
      {
        textAnchor: "start",
        transform: "translate(0px, 10px)"
      }
    ]),
    filledNodeText: mergeStyles([
      nodeTextStyle,
      {
        fill: ColorPalette.ErrorAnalysisLightText
      }
    ]),
    legend: {
      pointerEvents: "none"
    },
    linkLabel: {
      fill: "#777",
      font: "normal 12px Arial",
      fontFamily: "Arial, Helvetica, sans-serif",
      pointerEvents: "none",
      textAnchor: "middle"
    },
    linkLabelsTransitionGroup: {
      transform: "translate(0px, 90px)"
    },
    linksTransitionGroup: {
      transform: "translate(0px, 90px)"
    },
    node: {
      ":hover": {
        strokeWidth: "3px"
      },
      cursor: "pointer",
      opacity: "1",
      stroke: "#089acc",
      strokeWidth: "0px"
    },
    nodesGroup: {
      transform: "translate(0px, 90px)"
    },
    nodeText: mergeStyles([
      nodeTextStyle,
      {
        fill: ColorPalette.ErrorAnalysisDarkGreyText
      }
    ]),
    nopointer: {
      pointerEvents: "none"
    },
    svgOuterFrame: {
      margin: 0,
      padding: 0,
      width: "auto"
    },
    treeDescription: {
      padding: "30px 0px 0px 35px"
    }
  });
};
