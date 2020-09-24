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
  main: IStyle;
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
    main: {
      flex: 1,
      height: "100%",
      maxWidth: "750px"
    },
    textBody: {
      color: theme.semanticColors.bodyText,
      fontWeight: FontWeights.semilight,
      paddingBottom: "12px",
      paddingTop: "12px"
    }
  });
};
