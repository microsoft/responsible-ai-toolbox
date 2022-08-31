import { hideXlDown } from "@responsible-ai/core-ui";
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IStyle, mergeStyleSets, IProcessedStyleSet } from "@fluentui/react";

export interface IMatrixSummaryStyles {
  legendDescriptionStyle: IStyle;
}

export const matrixSummaryStyles: () => IProcessedStyleSet<IMatrixSummaryStyles> =
  () => {
    return mergeStyleSets<IMatrixSummaryStyles>({
      legendDescriptionStyle: {
        width: 500,
        ...hideXlDown
      }
    });
  };
