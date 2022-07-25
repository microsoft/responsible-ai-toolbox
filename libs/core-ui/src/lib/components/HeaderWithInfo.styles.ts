// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IStyle, mergeStyleSets, IProcessedStyleSet } from "@fluentui/react";

export interface IHeaderWithInfoStyles {
  boldText: IStyle;
  callout: IStyle;
}

export const headerWithInfoStyles: () => IProcessedStyleSet<IHeaderWithInfoStyles> =
  () => {
    return mergeStyleSets<IHeaderWithInfoStyles>({
      boldText: {
        fontWeight: "600",
        paddingBottom: "5px"
      },
      callout: {
        margin: "-18px 0 0 0"
      }
    });
  };
