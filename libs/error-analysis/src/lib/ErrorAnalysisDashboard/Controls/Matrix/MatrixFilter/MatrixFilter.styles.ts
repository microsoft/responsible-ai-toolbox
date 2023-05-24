// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IStyle, mergeStyleSets, IProcessedStyleSet } from "@fluentui/react";
import { flexMdDown, flexSmDown } from "@responsible-ai/core-ui";

export interface IMatrixFilterStyles {
  featureSelections: IStyle;
  matrixFilter: IStyle;
  rowSelection: IStyle;
  selections: IStyle;
}

export const matrixFilterStyles: () => IProcessedStyleSet<IMatrixFilterStyles> =
  () => {
    return mergeStyleSets<IMatrixFilterStyles>({
      featureSelections: { ...flexSmDown, marginLeft: "0 !important" },
      matrixFilter: {
        padding: "0px 0px 0px 25px"
      },
      rowSelection: {
        marginRight: "20px"
      },
      selections: flexMdDown
    });
  };
