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
      label: {
        color: "black",
        fontSize: FontSizes.small,
        justifySelf: "center",
        paddingBottom: "100%",
        width: "100%"
      },
      list: {
        fontSize: 0,
        position: "relative"
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
