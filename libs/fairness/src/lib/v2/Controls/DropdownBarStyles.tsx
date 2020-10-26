// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  getTheme,
  IProcessedStyleSet,
  IStyle,
  mergeStyleSets
} from "office-ui-fabric-react";

export interface IDropdownBarStyles {
  headerOptions: IStyle;
  dropDown: IStyle;
}

export const DropdownBarStyles: () => IProcessedStyleSet<
  IDropdownBarStyles
> = () => {
  const theme = getTheme();
  return mergeStyleSets<IDropdownBarStyles>({
    headerOptions: {
      backgroundColor: theme.semanticColors.bodyBackground,
      padding: "0 100px"
    },
    dropDown: {
      display: "inline-block",
      margin: "10px 10px 10px 0px"
    }
  });
};
