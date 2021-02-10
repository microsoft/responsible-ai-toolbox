// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  IStyle,
  mergeStyleSets,
  IProcessedStyleSet,
  mergeStyles
} from "office-ui-fabric-react";

export interface ITreeViewRendererStyles {
  clickedNodeDashed: IStyle;
  clickedNodeFull: IStyle;
  mainFrame: IStyle;
  treeDescription: IStyle;
  svgOuterFrame: IStyle;
  innerFrame: IStyle;
  node: IStyle;
  nodeText: IStyle;
  nopointer: IStyle;
  linkLabel: IStyle;
  detailLines: IStyle;
  details: IStyle;
  innerOpacityToggle: IStyle;
  opacityToggleRect: IStyle;
  opacityToggleCircle: IStyle;
  errorRateGradientStyle: IStyle;
  linksTransitionGroup: IStyle;
  nodesTransitionGroup: IStyle;
  tooltipTransitionGroup: IStyle;
  linkLabelsTransitionGroup: IStyle;
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
    details: {
      transform: "translate(0px, 5px)"
    },
    errorRateGradientStyle: {
      transform: "translate(100px, 60px)"
    },
    innerFrame: {
      height: "100%",
      margin: "0",
      padding: "0",
      width: "100%"
    },
    innerOpacityToggle: {
      transform: "translate(10px, 10px)"
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
    nodeText: {
      fill: "#555",
      fontSize: "10px",
      fontWeight: "bolder",
      pointerEvents: "none",
      transform: "translate(0px, 0px)"
    },
    nopointer: {
      pointerEvents: "none"
    },
    opacityToggleCircle: {
      transform: "translate(36px, 80px)"
    },
    opacityToggleRect: {
      transform: "translate(-5px, -5px)"
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
