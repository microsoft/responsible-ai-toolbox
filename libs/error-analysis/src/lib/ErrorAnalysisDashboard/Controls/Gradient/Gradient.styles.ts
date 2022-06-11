// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IStyle, mergeStyleSets, IProcessedStyleSet } from "@fluentui/react";

export interface IGradientStyles {
  gradientTick: IStyle;
}

export const gradientStyles: () => IProcessedStyleSet<IGradientStyles> = () => {
  return mergeStyleSets<IGradientStyles>({
    gradientTick: {
      stroke: "black",
      strokeWidth: 1
    }
  });
};
