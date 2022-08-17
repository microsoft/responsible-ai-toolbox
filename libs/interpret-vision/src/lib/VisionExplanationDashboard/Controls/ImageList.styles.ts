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
  image: IStyle;
  imageFrame: IStyle;
  imageSizer: IStyle;
}

export const imageListStyles: () => IProcessedStyleSet<IDatasetExplorerTabStyles> =
  () => {
    return mergeStyleSets<IDatasetExplorerTabStyles>({
      image: {
        left: 0,
        position: "absolute",
        top: 0,
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
        paddingBottom: "105%",
        textAlign: "center"
      },
      label: {
        bottom: 10,
        boxSizing: "border-box",
        color: "black",
        fontSize: FontSizes.small,
        fontWeight: "600",
        justifySelf: "center",
        left: 0,
        position: "absolute",
        width: "100%"
      },
      list: {
        fontSize: 0,
        position: "relative"
      },
      tile: {
        float: "left",
        position: "relative",
        textAlign: "center"
      }
    });
  };
