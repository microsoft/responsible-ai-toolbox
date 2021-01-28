// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  IProcessedStyleSet,
  IStyle,
  mergeStyleSets
} from "office-ui-fabric-react";

export interface IWizardFooterStyles {
  frame: IStyle;
  next: IStyle;
  back: IStyle;
}

export const WizardFooterStyles: () => IProcessedStyleSet<
  IWizardFooterStyles
> = () => {
  return mergeStyleSets<IWizardFooterStyles>({
    back: {
      fontSize: "14px",
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
      fontSize: "14px",
      fontWeight: "400",
      lineHeight: "24px",
      marginLeft: "16px",
      padding: "12px"
    }
  });
};
