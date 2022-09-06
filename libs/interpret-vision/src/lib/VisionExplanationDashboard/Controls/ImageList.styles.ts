// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  IStyle,
  mergeStyleSets,
  IProcessedStyleSet,
  FontSizes
} from "@fluentui/react";

export interface IDatasetExplorerTabStyles {
  list: IStyle;
  tile: IStyle;
  label: IStyle;
  labelContainer: IStyle;
  image: IStyle;
  imageFrame: IStyle;
  imageSizer: IStyle;
  selectedImage: IStyle;
}

export const imageListStyles: () => IProcessedStyleSet<IDatasetExplorerTabStyles> =
  () => {
    return mergeStyleSets<IDatasetExplorerTabStyles>({
      image: {
        left: -6,
        position: "absolute",
        top: -5,
        width: "100%"
      },
      imageFrame: {
        bottom: 2,
        left: 2,
        position: "absolute",
        right: 2,
        top: 2
      },
      imageSizer: {
        marginBottom: "2%",
        paddingBottom: "100%"
      },
      label: {
        color: "white",
        fontSize: FontSizes.small,
        fontWeight: "600"
      },
      labelContainer: {
        background: "rgba(0,0,0,0.3)",
        boxSizing: "border-box",
        padding: 10,
        position: "absolute",
        textAlign: "center"
      },
      list: {
        fontSize: 0,
        overflow: "hidden",
        position: "relative"
      },
      selectedImage: {
        border: "5px solid blue",
        bottom: 2,
        height: "90%",
        left: 2,
        position: "absolute",
        right: 2,
        top: 2,
        width: "90%"
      },
      tile: {
        float: "left",
        outline: "none",
        overflow: "hidden",
        position: "relative",
        textAlign: "center"
      }
    });
  };
