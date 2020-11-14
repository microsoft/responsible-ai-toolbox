// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  IStyle,
  mergeStyleSets,
  IProcessedStyleSet,
  getTheme
} from "office-ui-fabric-react";

export interface IInspectionViewStyles {
  choiceGroupContainerStyle: IStyle;
  choiceItemRootStyle: IStyle;
  page: IStyle;
  headerStyle: IStyle;
}

export const InspectionViewStyles: () => IProcessedStyleSet<
  IInspectionViewStyles
> = () => {
  const theme = getTheme();
  return mergeStyleSets<IInspectionViewStyles>({
    choiceGroupContainerStyle: {
      display: "flex",
      flexDirection: "row",
      justifyContent: "flex-start"
    },
    choiceItemRootStyle: {
      padding: "0px 20px 0px 20px"
    },
    headerStyle: {
      fontSize: "22px"
    },
    page: {
      backgroundColor: theme.semanticColors.bodyBackground,
      color: theme.semanticColors.bodyText,
      maxHeight: "1000px"
    }
  });
};
