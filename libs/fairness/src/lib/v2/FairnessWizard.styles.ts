// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  getTheme,
  IProcessedStyleSet,
  IStyle,
  mergeStyleSets
} from "office-ui-fabric-react";

export interface IFairnessWizardStyles {
  frame: IStyle;
  thinHeader: IStyle;
  headerLeft: IStyle;
  pivot: IStyle;
  body: IStyle;
  errorMessage: IStyle;
}

export const FairnessWizardStyles: () => IProcessedStyleSet<
  IFairnessWizardStyles
> = () => {
  const theme = getTheme();
  return mergeStyleSets<IFairnessWizardStyles>({
    body: {
      backgroundColor: theme.semanticColors.bodyBackground,
      display: "flex",
      flex: 1,
      flexDirection: "column"
    },
    errorMessage: {
      fontSize: "18px",
      padding: "50px"
    },
    frame: {
      minHeight: "800px",
      minWidth: "800px"
    },
    headerLeft: {
      padding: "20px"
    },
    pivot: {
      display: "flex",
      flex: 1,
      flexDirection: "column",
      padding: "30px 90px 0 82px"
    },
    thinHeader: {
      backgroundColor: theme.semanticColors.bodyBackground,
      color: theme.semanticColors.bodyText,
      height: "36px"
    }
  });
};
