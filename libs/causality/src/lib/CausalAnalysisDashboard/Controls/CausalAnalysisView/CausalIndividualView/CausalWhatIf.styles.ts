// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  IProcessedStyleSet,
  getTheme,
  mergeStyleSets,
  IStyle
} from "@fluentui/react";

export interface ICausalWhatIfStyles {
  currentOutcome: IStyle;
  newOutcome: IStyle;
  boldText: IStyle;
  treatmentValue: IStyle;
}

export const causalWhatIfStyles: () => IProcessedStyleSet<ICausalWhatIfStyles> =
  () => {
    const theme = getTheme();
    return mergeStyleSets<ICausalWhatIfStyles>({
      boldText: {
        fontWeight: "600"
      },
      currentOutcome: {
        borderLeftColor: theme.semanticColors.primaryButtonBackground,
        borderLeftStyle: "solid",
        borderLeftWidth: "5px",
        paddingLeft: "10px"
      },
      newOutcome: {
        borderLeftColor: theme.semanticColors.errorText,
        borderLeftStyle: "solid",
        borderLeftWidth: "5px",
        paddingLeft: "10px"
      },
      treatmentValue: {
        color: theme.semanticColors.disabledText
      }
    });
  };
