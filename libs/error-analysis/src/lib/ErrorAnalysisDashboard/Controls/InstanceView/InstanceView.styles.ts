// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  IStyle,
  mergeStyleSets,
  IProcessedStyleSet,
  getTheme
} from "office-ui-fabric-react";

export interface IInstanceViewStyles {
  pivotLabelWrapper: IStyle;
  page: IStyle;
}

export const InstanceViewStyles: () => IProcessedStyleSet<
  IInstanceViewStyles
> = () => {
  const theme = getTheme();
  return mergeStyleSets<IInstanceViewStyles>({
    page: {
      backgroundColor: theme.semanticColors.bodyBackground,
      color: theme.semanticColors.bodyText,
      maxHeight: "1000px"
    },
    pivotLabelWrapper: {
      display: "flex",
      flexDirection: "row",
      justifyContent: "flex-start",
      padding: "5px 60px 5px 60px"
    }
  });
};
