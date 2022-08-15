// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IStyle, mergeStyleSets, IProcessedStyleSet } from "@fluentui/react";

export interface IMatrixCategoryStyles {
  tooltip: IStyle;
}

export const matrixCategoryStyles: () => IProcessedStyleSet<IMatrixCategoryStyles> =
  () => {
    return mergeStyleSets<IMatrixCategoryStyles>({
      tooltip: {
        root: {
          alignItems: "center",
          display: "flex",
          height: "100%",
          justifyContent: "center",
          width: "100%"
        }
      }
    });
  };
