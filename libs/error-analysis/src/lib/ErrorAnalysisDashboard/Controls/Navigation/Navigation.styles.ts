// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  IStyle,
  mergeStyleSets,
  IProcessedStyleSet,
  getTheme
} from "office-ui-fabric-react";

export interface INavigationStyles {
  navigation: IStyle;
  breadcrumb: IStyle;
}

export const navigationStyles: () => IProcessedStyleSet<
  INavigationStyles
> = () => {
  const theme = getTheme();
  return mergeStyleSets<INavigationStyles>({
    breadcrumb: {
      padding: "0px 0px 0px 10px"
    },
    navigation: {
      backgroundColor: theme.palette.white,
      borderLeft: "1px solid #C8C8C8",
      borderRight: "1px solid #C8C8C8",
      borderTop: "1px solid #C8C8C8",
      boxSizing: "border-box",
      color: theme.palette.black,
      height: "35px",
      width: "100%"
    }
  });
};
