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
  pivot: IStyle;
  body: IStyle;
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
    frame: {
      minHeight: "800px",
      minWidth: "800px"
    },
    pivot: {
      display: "flex",
      flex: 1,
      flexDirection: "column",
      padding: "30px 90px 0 82px"
    }
  });
};
