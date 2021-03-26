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
  innerFrame: IStyle;
  legend: IStyle;
  linkLabel: IStyle;
  linkLabelsTransitionGroup: IStyle;
  linksTransitionGroup: IStyle;
  mainFrame: IStyle;
  node: IStyle;
  nodeText: IStyle;
  nodesTransitionGroup: IStyle;
  nopointer: IStyle;
  svgOuterFrame: IStyle;
  treeDescription: IStyle;
  tooltipTransitionGroup: IStyle;
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
    innerFrame: {
      height: "100%",
      margin: "0",
      padding: "0",
      width: "100%"
    },
    legend: {
      pointerEvents: "none",
      position: "absolute"
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
    mainFrame: {
      height: "1100px",
      margin: "0",
      padding: "0",
      width: "100%"
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
    nodesTransitionGroup: {
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
      margin: "0",
      padding: "0",
      width: "100%"
    },
    tooltipTransitionGroup: {
      transform: "translate(40px, 90px)"
    },
    treeDescription: {
      padding: "30px 0px 0px 35px"
    }
  });
};
