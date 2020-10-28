// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  getTheme,
  IProcessedStyleSet,
  IStyle,
  mergeStyleSets,
  FontWeights
} from "office-ui-fabric-react";

export interface IFairnessTabStyles {
  iconClass: IStyle;
  itemsList: IStyle;
  frame: IStyle;
  main: IStyle;
  header: IStyle;
  textBody: IStyle;
}

export const FairnessTabStyles: () => IProcessedStyleSet<
  IFairnessTabStyles
> = () => {
  const theme = getTheme();
  return mergeStyleSets<IFairnessTabStyles>({
    frame: {
      height: "100%",
      width: "750px"
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
      minWidth: "550px"
    },
    textBody: {
      color: theme.semanticColors.bodyText,
      fontWeight: FontWeights.semilight,
      paddingBottom: "50px",
      paddingTop: "12px"
    }
  });
};
