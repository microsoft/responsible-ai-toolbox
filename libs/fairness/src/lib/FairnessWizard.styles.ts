// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IProcessedStyleSet, IStyle, mergeStyleSets } from "@fluentui/react";

export interface IFairnessWizardStyles {
  frame: IStyle;
  pivot: IStyle;
}

export const FairnessWizardStyles: () => IProcessedStyleSet<IFairnessWizardStyles> =
  () => {
    return mergeStyleSets<IFairnessWizardStyles>({
      frame: {
        minHeight: "800px",
        minWidth: "800px",
        width: "100%"
      },
      pivot: {
        display: "flex",
        flex: 1,
        flexDirection: "column",
        padding: "30px 90px 0 82px"
      }
    });
  };
