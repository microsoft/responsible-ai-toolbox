// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  IStyle,
  mergeStyleSets,
  IProcessedStyleSet
} from "office-ui-fabric-react";

export interface IMatrixFilterStyles {
  matrixFilter: IStyle;
}

export const matrixFilterStyles: () => IProcessedStyleSet<IMatrixFilterStyles> =
  () => {
    return mergeStyleSets<IMatrixFilterStyles>({
      matrixFilter: {
        padding: "0px 0px 0px 25px"
      }
    });
  };
