// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  IStyle,
  mergeStyleSets,
  IProcessedStyleSet,
  FontSizes,
  getTheme
} from "@fluentui/react";

export interface IDataCharacteristicsStyles {
  list: IStyle;
  tile: IStyle;
  label: IStyle;
  labelsContainer: IStyle;
  iconContainer: IStyle;
  image: IStyle;
  mainContainer: IStyle;
  progressBar: IStyle;
  progressBarBackground: IStyle;
  progressBarForeground: IStyle;
  successIndicator: IStyle;
  errorIndicator: IStyle;
  instanceContainer: IStyle;
}

export const dataCharacteristicsStyles: () => IProcessedStyleSet<IDataCharacteristicsStyles> =
  () => {
    const theme = getTheme();
    return mergeStyleSets<IDataCharacteristicsStyles>({
      errorIndicator: {
        border: `2px solid ${theme.semanticColors.errorIcon}`,
        boxSizing: "border-box",
        height: 10
      },
      iconContainer: {
        marginRight: 30,
        position: "relative",
        top: -5
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
      labelsContainer: {
        overflow: "auto",
        width: "100%"
      },
      list: {
        fontSize: 0,
        position: "relative"
      },
      mainContainer: {
        border: `1px solid ${theme.semanticColors.disabledBorder}`,
        overflow: "auto",
        width: "100%"
      },
      progressBar: {
        verticalAlign: "center"
      },
      progressBarBackground: {
        backgroundColor: theme.semanticColors.disabledBackground,
        height: 10
      },
      progressBarForeground: {
        backgroundColor: theme.palette.blue,
        height: 10
      },
      successIndicator: {
        backgroundColor: theme.semanticColors.successIcon,
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
