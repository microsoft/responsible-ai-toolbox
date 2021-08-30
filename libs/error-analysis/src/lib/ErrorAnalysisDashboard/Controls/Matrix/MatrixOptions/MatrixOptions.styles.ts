// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  mergeStyleSets,
  IProcessedStyleSet,
  IStyle
} from "office-ui-fabric-react";

export interface IMatrixLegendStyles {
  sliderLabelStyle: IStyle;
  sliderStackStyle: IStyle;
  toggleStackStyle: IStyle;
}

export const matrixOptionsStyles: () => IProcessedStyleSet<IMatrixLegendStyles> =
  () => {
    return mergeStyleSets<IMatrixLegendStyles>({
      sliderLabelStyle: {
        padding: 0
      },
      sliderStackStyle: {
        minWidth: 200
      },
      toggleStackStyle: {
        minWidth: 100
      }
    });
  };
