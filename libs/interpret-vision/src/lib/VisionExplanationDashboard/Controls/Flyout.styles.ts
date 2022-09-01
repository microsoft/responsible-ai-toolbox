// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  IStyle,
  mergeStyleSets,
  IProcessedStyleSet,
  getTheme,
  mergeStyles
} from "@fluentui/react";

export interface IFlyoutStyles {
  cell: IStyle;
  errorIcon: IStyle;
  featureListContainer: IStyle;
  iconContainer: IStyle;
  image: IStyle;
  imageContainer: IStyle;
  errorTitle: IStyle;
  successTitle: IStyle;
  label: IStyle;
  mainContainer: IStyle;
  successIcon: IStyle;
  sectionIndent: IStyle;
  separator: IStyle;
  title: IStyle;
}

export const flyoutStyles: () => IProcessedStyleSet<IFlyoutStyles> = () => {
  const theme = getTheme();
  const title: IStyle = {
    fontWeight: "600"
  };
  return mergeStyleSets<IFlyoutStyles>({
    cell: {
      marginBottom: "20px"
    },
    errorIcon: {
      color: theme.semanticColors.errorIcon,
      fontSize: "large",
      fontWeight: "600"
    },
    errorTitle: mergeStyles(title, {
      color: theme.semanticColors.errorText
    }),
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
    mainContainer: {
      height: "100%",
      overflow: "hidden"
    },
    sectionIndent: {
      marginLeft: "6%"
    },
    separator: {
      width: "100%"
    },
    successIcon: {
      color: theme.semanticColors.successIcon,
      fontSize: "large",
      fontWeight: "600"
    },
    successTitle: mergeStyles(title, {
      color: theme.semanticColors.successIcon
    }),
    title
  });
};
