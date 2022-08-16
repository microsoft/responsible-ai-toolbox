// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  FontSizes,
  IProcessedStyleSet,
  IStyle,
  mergeStyleSets
} from "@fluentui/react";

export interface IWizardFooterStyles {
  frame: IStyle;
  next: IStyle;
  back: IStyle;
}

export const WizardFooterStyles: () => IProcessedStyleSet<IWizardFooterStyles> =
  () => {
    return mergeStyleSets<IWizardFooterStyles>({
      back: {
        fontSize: FontSizes.size14,
        fontWeight: "400",
        lineHeight: "24px",
        padding: "12px"
      },
      frame: {
        display: "inline-flex",
        flexDirection: "row-reverse",
        paddingBottom: "10px",
        paddingTop: "10px"
      },
      next: {
        fontSize: FontSizes.size14,
        fontWeight: "400",
        lineHeight: "24px",
        marginLeft: "16px",
        padding: "12px"
      }
    });
  };
