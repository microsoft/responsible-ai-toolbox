// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IStyle, mergeStyleSets, IProcessedStyleSet } from "@fluentui/react";

export interface IWhatIfStyles {
  divider: IStyle;
  section: IStyle;
  subsection: IStyle;
  header: IStyle;
}

export const whatIfStyles: () => IProcessedStyleSet<IWhatIfStyles> = () => {
  return mergeStyleSets<IWhatIfStyles>({
    divider: {
      borderTop: "1px solid #DADADA",
      left: "50%",
      margin: "0",
      marginRight: "-50%",
      position: "absolute",
      transform: "translate(-50%, 0%)",
      width: "100%"
    },
    header: {
      fontSize: "14px",
      fontWeight: "600"
    },
    section: {
      paddingBottom: "10px !important",
      paddingLeft: "20px",
      paddingTop: "10px !important"
    },
    subsection: {}
  });
};
