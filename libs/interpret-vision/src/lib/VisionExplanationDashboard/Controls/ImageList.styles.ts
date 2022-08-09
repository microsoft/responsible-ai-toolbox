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
<<<<<<< HEAD
        paddingBottom: 10,
=======
        paddingBottom: "100%",
>>>>>>> 46e04a056f03bc313b9772a6b29c79a92f937530
        width: "100%"
      },
      list: {
        fontSize: 0,
        position: "relative"
      },
      tile: {
        float: "left",
<<<<<<< HEAD
        marginTop: 10,
        paddingLeft: 10,
        paddingRight: 10,
=======
        marginTop: "0.5%",
        paddingLeft: "1%",
        paddingRight: "1%",
>>>>>>> 46e04a056f03bc313b9772a6b29c79a92f937530
        position: "relative",
        textAlign: "center"
      }
    });
  };
