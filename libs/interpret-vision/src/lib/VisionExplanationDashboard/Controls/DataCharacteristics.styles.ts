// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  IStyle,
  mergeStyleSets,
  IProcessedStyleSet,
  FontSizes
} from "@fluentui/react";

export interface IDataCharacteristicsStyles {
  list: IStyle;
  tile: IStyle;
  label: IStyle;
  image: IStyle;
  mainContainer: IStyle;
  successIndicator: IStyle;
  errorIndicator: IStyle;
  instanceContainer: IStyle;
}

export const dataCharacteristicsStyles: () => IProcessedStyleSet<IDataCharacteristicsStyles> =
  () => {
    return mergeStyleSets<IDataCharacteristicsStyles>({
      errorIndicator: {
        border: "2px solid #D13A5F",
        boxSizing: "border-box",
        height: 10
      },
      image: {
        width: "100%"
      },
      instanceContainer: {
        marginLeft: 10
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
      mainContainer: {
        border: "1px solid grey",
        overflow: "auto",
        width: "100%"
      },
      successIndicator: {
        backgroundColor: "#60B877",
        height: 10
      },
      tile: {
        float: "left",
        marginTop: 5,
        paddingLeft: 10,
        paddingRight: 10,
        position: "relative",
        textAlign: "center"
      }
    });
  };
