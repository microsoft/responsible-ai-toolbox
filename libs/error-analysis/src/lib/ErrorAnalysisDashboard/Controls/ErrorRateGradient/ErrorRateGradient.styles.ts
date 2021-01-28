// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  IStyle,
  mergeStyleSets,
  IProcessedStyleSet
} from "office-ui-fabric-react";

export interface IErrorRateGradientStyles {
  gradientTick: IStyle;
}

export const errorRateGradientStyles: () => IProcessedStyleSet<
  IErrorRateGradientStyles
> = () => {
  return mergeStyleSets<IErrorRateGradientStyles>({
    gradientTick: {
      stroke: "black",
      strokeWidth: 1
    }
  });
};
