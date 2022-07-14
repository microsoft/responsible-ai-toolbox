// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IStyle, mergeStyleSets, IProcessedStyleSet } from "@fluentui/react";
import { NeutralColors, SharedColors } from "@fluentui/theme";

export interface ITextExplanationDashboardStyles {
  chartRight: IStyle;
  textHighlighting: IStyle;
  legend: IStyle;
  posFeatureImportance: IStyle;
  negFeatureImportance: IStyle;
}

export const textExplanationDashboardStyles: () => IProcessedStyleSet<ITextExplanationDashboardStyles> =
  () => {
    return mergeStyleSets<ITextExplanationDashboardStyles>({
      chartRight: {
        maxWidth: "230px",
        minWidth: "230px"
      },
      legend: {
        color: NeutralColors.gray80
      },
      negFeatureImportance: {
        color: SharedColors.blue10,
        textDecorationLine: "underline"
      },
      posFeatureImportance: {
        backgroundColor: SharedColors.blue10,
        color: NeutralColors.white
      },
      textHighlighting: {
        borderColor: NeutralColors.gray80,
        borderRadius: "1px",
        borderStyle: "groove",
        lineHeight: "32px",
        maxHeight: "200px",
        minWidth: "400px",
        padding: "25px"
      }
    });
  };
