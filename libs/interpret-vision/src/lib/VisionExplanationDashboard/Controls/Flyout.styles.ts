// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  IStyle,
  mergeStyleSets,
  IProcessedStyleSet,
  FontSizes
} from "@fluentui/react";

export interface IFlyoutStyles {
  line: IStyle;
  list: IStyle;
  tile: IStyle;
  sizer: IStyle;
  padder: IStyle;
  label: IStyle;
  image: IStyle;
}

export const flyoutStyles: () => IProcessedStyleSet<IFlyoutStyles> = () => {
  return mergeStyleSets<IFlyoutStyles>({
    image: {
      left: 0,
      position: "absolute",
      top: 0,
      width: "100%"
    },
    label: {
      color: "black",
      fontSize: FontSizes.small,
      justifySelf: "center",
      paddingBottom: "100%",
      width: "100%"
    },
    line: {
      borderTop: "1px solid #EDEBE9"
    },
    list: {
      fontSize: 0,
      overflow: "scroll",
      position: "relative"
    },
    padder: {
      bottom: 2,
      left: 2,
      position: "absolute",
      right: 2,
      top: 2
    },
    sizer: {
      paddingBottom: "100%"
    },
    tile: {
      float: "left",
      marginTop: "0.5%",
      paddingLeft: "1%",
      paddingRight: "1%",
      position: "relative",
      textAlign: "center"
    }
  });
};
