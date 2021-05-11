// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  IStyle,
  mergeStyleSets,
  IProcessedStyleSet,
  mergeStyles,
  getTheme
} from "office-ui-fabric-react";

import { ColorPalette } from "../../ColorPalette";

export interface ITreeViewRendererStyles {
  clickedNodeDashed: IStyle;
  clickedNodeFull: IStyle;
  detailLines: IStyle;
  filledNodeText: IStyle;
  legend: IStyle;
  linkLabel: IStyle;
  node: IStyle;
  nodeText: IStyle;
  nopointer: IStyle;
  svgOuterFrame: IStyle;
  svgContainer: IStyle;
  treeDescription: IStyle;
}

export const treeViewRendererStyles: () => IProcessedStyleSet<
  ITreeViewRendererStyles
> = () => {
  const theme = getTheme();
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
    detailLines: {
      fill: theme.semanticColors.inputBackground,
      fontWeight: "bold",
      pointerEvents: "none",
      textAnchor: "start",
      transform: "translate(0px, 10px)"
    },
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
      pointerEvents: "none",
      textAnchor: "middle"
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
    nodeText: mergeStyles([
      nodeTextStyle,
      {
        fill: ColorPalette.ErrorAnalysisDarkGreyText
      }
    ]),
    nopointer: {
      pointerEvents: "none"
    },
    svgContainer: {
      overflow: "auto",
      width: "100%"
    },
    svgOuterFrame: {
      margin: 0,
      outline: "none",
      padding: 0
    },
    treeDescription: {
      padding: "30px 0px 0px 35px"
    }
  });
};
