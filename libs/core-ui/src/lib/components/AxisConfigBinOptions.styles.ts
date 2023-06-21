// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IProcessedStyleSet, IStyle, mergeStyleSets } from "@fluentui/react";

export interface IAxisConfigBinOptionStyles {
  hideMinMax: IStyle;
  minMax: IStyle;
}

export const axisConfigBinOptionsStyles: () => IProcessedStyleSet<IAxisConfigBinOptionStyles> =
  () => {
    return mergeStyleSets<IAxisConfigBinOptionStyles>({
      hideMinMax: { height: 48 },
      minMax: {
        padding: "8px 0"
      }
    });
  };
