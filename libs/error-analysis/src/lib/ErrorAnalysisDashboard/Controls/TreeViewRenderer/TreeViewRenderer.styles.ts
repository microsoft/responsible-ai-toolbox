// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  IStyle,
  mergeStyleSets,
  IProcessedStyleSet,
  getTheme
} from "@fluentui/react";
import {
  descriptionMaxWidth,
  flexXlDown,
  hideXlDown
} from "@responsible-ai/core-ui";
import { Property } from "csstype";

export interface ITreeViewRendererStyles {
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
  return mergeStyleSets<ITreeViewRendererStyles>({
    infoWithText: {
      maxWidth: descriptionMaxWidth,
      ...hideXlDown
    },
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
    nodeText: {
      fontSize: "10px",
      fontWeight: "bold",
      pointerEvents: "none"
    },
    nopointer: {
      pointerEvents: "none"
    },
    svgContainer: {
      overflow: "auto",
      width: "100%",
      ...flexXlDown
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
