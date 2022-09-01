// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  IStyle,
  mergeStyleSets,
  IProcessedStyleSet,
  FontSizes,
  getTheme,
  mergeStyles
} from "@fluentui/react";

export interface IDatasetExplorerTabStyles {
  indicator: IStyle;
  errorIndicator: IStyle;
  successIndicator: IStyle;
  list: IStyle;
  tile: IStyle;
  label: IStyle;
  labelPredicted: IStyle;
  labelContainer: IStyle;
  image: IStyle;
  imageFrame: IStyle;
  imageSizer: IStyle;
}

export const imageListStyles: () => IProcessedStyleSet<IDatasetExplorerTabStyles> =
  () => {
    const theme = getTheme();
    const indicator: IStyle = {
      borderRadius: 45,
      marginLeft: 5,
      marginTop: 2,
      textAlign: "center"
    };
    return mergeStyleSets<IDatasetExplorerTabStyles>({
      errorIndicator: mergeStyles(indicator, {
        backgroundColor: theme.semanticColors.errorBackground
      }),
      image: {
        left: -20,
        position: "absolute",
        top: 22
      },
      imageFrame: {
        bottom: 2,
        left: 1,
        position: "absolute",
        right: 2,
        top: 2
      },
      imageSizer: {
        overflow: "hidden"
        //paddingBottom: "80%"
      },
      indicator,
      label: {
        color: "white",
        fontSize: FontSizes.small,
        fontWeight: "600",
        paddingLeft: 10
      },
      labelContainer: {
        background: "rgba(0,0,0,0.4)",
        boxSizing: "border-box",
        paddingBottom: 5,
        paddingTop: 2,
        position: "relative",
        textAlign: "start",
        top: 4,
        width: "98%"
      },
      labelPredicted: {
        color: "black",
        fontSize: FontSizes.small
      },
      list: {
        fontSize: 0,
        overflow: "hidden",
        position: "relative"
      },
      successIndicator: mergeStyles(indicator, {
        backgroundColor: theme.semanticColors.successBackground
      }),
      tile: {
        float: "left",
        outline: "none",
        overflow: "hidden",
        position: "relative",
        textAlign: "center"
      }
    });
  };
