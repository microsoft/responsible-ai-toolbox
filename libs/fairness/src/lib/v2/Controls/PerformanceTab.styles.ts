// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  getTheme,
  IProcessedStyleSet,
  IStyle,
  mergeStyleSets,
  FontWeights
} from "office-ui-fabric-react";

export interface IPerformanceTabStyles {
  iconClass: IStyle;
  itemsList: IStyle;
  frame: IStyle;
  header: IStyle;
  textBody: IStyle;
}

export const PerformanceTabStyles: () => IProcessedStyleSet<
  IPerformanceTabStyles
> = () => {
  const theme = getTheme();
  return mergeStyleSets<IPerformanceTabStyles>({
    frame: {
      height: "100%"
    },
    header: {
      color: theme.semanticColors.bodyText,
      fontWeight: FontWeights.semibold,
      margin: "26px 0"
    },
    iconClass: {
      fontSize: "20px",
      position: "absolute",
      right: "10px",
      top: "10px"
    },
    itemsList: {
      overflowY: "auto"
    },
    textBody: {
      color: theme.semanticColors.bodyText,
      fontWeight: FontWeights.semilight,
      paddingBottom: "50px",
      paddingTop: "12px"
    }
  });
};
