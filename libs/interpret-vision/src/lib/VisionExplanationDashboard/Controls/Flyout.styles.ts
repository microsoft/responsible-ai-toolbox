// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IStyle, mergeStyleSets, IProcessedStyleSet } from "@fluentui/react";

export interface IFlyoutStyles {
  errorIcon: IStyle;
  featureListContainer: IStyle;
  iconContainer: IStyle;
  image: IStyle;
  imageContainer: IStyle;
  title: IStyle;
  label: IStyle;
  line: IStyle;
  mainContainer: IStyle;
  successIcon: IStyle;
}

export const flyoutStyles: () => IProcessedStyleSet<IFlyoutStyles> = () => {
  return mergeStyleSets<IFlyoutStyles>({
    errorIcon: {
      color: "#C50F1F",
      fontSize: "large",
      fontWeight: "600"
    },
    featureListContainer: {
      height: 300,
      overflow: "auto"
    },
    iconContainer: {
      position: "relative",
      top: "2px"
    },
    image: {
      marginBottom: "20px"
    },
    imageContainer: {
      maxHeight: "250px",
      maxWidth: "250px"
    },
    label: {
      bottom: 20,
      position: "relative",
      textAlign: "start"
    },
    line: {
      borderBottom: "1px solid #EDEBE9",
      paddingBottom: "10px",
      width: "100%"
    },
    mainContainer: {
      height: "100%",
      overflow: "hidden"
    },
    successIcon: {
      color: "#6BB700",
      fontSize: "large",
      fontWeight: "600"
    },
    title: {
      fontWeight: "600"
    }
  });
};
