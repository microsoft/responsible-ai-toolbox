// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IStyle, mergeStyleSets, IProcessedStyleSet } from "@fluentui/react";

export interface IBinningControlStyles {
  featurePicker: IStyle;
  rangeView: IStyle;
  parameterSet: IStyle;
}

export const binningControlStyles: IProcessedStyleSet<IBinningControlStyles> =
  mergeStyleSets<IBinningControlStyles>({
    featurePicker: {
      borderBottom: "1px solid grey",
      display: "flex",
      justifyContent: "space-between",
      padding: "3px 15px"
    },
    parameterSet: { display: "flex" },
    rangeView: {
      display: "flex",
      justifyContent: "flex-end"
    }
  });
