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
        marginBottom: 5,
        position: "absolute",
        right: 2,
        top: 5
      },
      imageSizer: {
        paddingBottom: "100%",
        textAlign: "center"
      },
      label: {
        background: "rgba(0,0,0,0.3)",
        boxSizing: "border-box",
        color: "white",
        fontSize: FontSizes.small,
        fontWeight: "600",
        justifySelf: "center",
        left: 5,
        padding: 10,
        position: "absolute",
        top: 5
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
