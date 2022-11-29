// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  IStyle,
  mergeStyleSets,
  IProcessedStyleSet,
  getTheme
} from "@fluentui/react";

export interface IInstanceViewStyles {
  choiceGroupContainerStyle: IStyle;
  choiceItemRootStyle: IStyle;
  page: IStyle;
  selectedTextStyle: IStyle;
  stackItemsStyle: IStyle;
  frame: IStyle;
}

export const InstanceViewStyles: () => IProcessedStyleSet<IInstanceViewStyles> =
  () => {
    const theme = getTheme();
    return mergeStyleSets<IInstanceViewStyles>({
      choiceGroupContainerStyle: {
        display: "flex",
        flexDirection: "row",
        justifyContent: "flex-start"
      },
      choiceItemRootStyle: {
        padding: "0px 20px 0px 20px"
      },
      frame: {
        width: "inherit"
      },
      page: {
        backgroundColor: theme.semanticColors.bodyBackground,
        color: theme.semanticColors.bodyText
      },
      selectedTextStyle: { color: getTheme().palette.neutralPrimaryAlt },
      stackItemsStyle: {
        padding: "0px 0px 0px 26px"
      }
    });
  };
