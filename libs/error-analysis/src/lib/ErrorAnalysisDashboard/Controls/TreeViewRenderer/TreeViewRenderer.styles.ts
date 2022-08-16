// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  IStyle,
  mergeStyleSets,
  IProcessedStyleSet,
  mergeStyles,
  getTheme
} from "@fluentui/react";
import { descriptionMaxWidth } from "@responsible-ai/core-ui";
import { Property } from "csstype";

import { ColorPalette } from "../../ColorPalette";

export interface ITreeViewRendererStyles {
  filledNodeText: IStyle;
  infoWithText: IStyle;
  legend: IStyle;
  linkLabel: IStyle;
  node: IStyle;
  nodeDisabled: IStyle;
  nodeText: IStyle;
  nopointer: IStyle;
  svgOuterFrame: IStyle;
  svgContainer: IStyle;
  treeDescription: IStyle;
  treeNodeOutline: IStyle;
}

export const treeViewRendererStyles = (props?: {
  onSelectedPath?: boolean;
  fill?: Property.Color;
}): IProcessedStyleSet<ITreeViewRendererStyles> => {
  const theme = getTheme();
  const nodeTextStyle = {
    fontSize: "10px",
    fontWeight: "bolder",
    pointerEvents: "none",
    transform: "translate(0px, 0px)"
  };
  return mergeStyleSets<ITreeViewRendererStyles>({
    filledNodeText: mergeStyles([
      nodeTextStyle,
      {
        fill: ColorPalette.ErrorAnalysisLightText
      }
    ]),
    infoWithText: { maxWidth: descriptionMaxWidth },
    legend: {
      pointerEvents: "none"
    },
    linkLabel: {
      fill: theme.semanticColors.bodyTextChecked,
      pointerEvents: "none",
      textAnchor: "middle"
    },
    node: {
      ":hover": {
        stroke: `${theme.semanticColors.link} !important`,
        strokeWidth: "6px !important"
      },
      cursor: "pointer"
    },
    nodeDisabled: {
      stroke: props?.fill,
      strokeWidth: 2
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
    },
    treeNodeOutline: {
      ":focus": {
        outline: "none"
      },
      ":focus-visible": {
        outline: `1px solid ${theme.semanticColors.link}`
      }
    }
  });
};
