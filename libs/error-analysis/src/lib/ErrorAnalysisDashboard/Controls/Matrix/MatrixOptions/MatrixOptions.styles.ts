// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { mergeStyleSets, IProcessedStyleSet, IStyle } from "@fluentui/react";

export interface IMatrixLegendStyles {
  sliderLabelStyle: IStyle;
  sliderStackStyle: IStyle;
  toggleStackStyle: IStyle;
  matrixOptions: IStyle;
}

export const matrixOptionsStyles: () => IProcessedStyleSet<IMatrixLegendStyles> =
  () => {
    return mergeStyleSets<IMatrixLegendStyles>({
      matrixOptions: {
        selectors: {
          "@media screen and (max-width: 639px)": {
            margin: "15px 0 !important"
          }
        }
      },
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
