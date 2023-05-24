// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  getTheme,
  IStackTokens,
  IStyle,
  mergeStyleSets,
  IProcessedStyleSet
} from "@fluentui/react";

export const verticalComponentTokens: IStackTokens = { padding: "l1" };
export const horizontalComponentTokens: IStackTokens = {
  childrenGap: "l1",
  padding: "0px 0px 0px 25px"
};

export interface IIndividualFeatureImportanceViewStyles {
  boldText: IStyle;
}

export const individualFeatureImportanceStyles: () => IProcessedStyleSet<IIndividualFeatureImportanceViewStyles> =
  () => {
    const theme = getTheme();
    return mergeStyleSets<IIndividualFeatureImportanceViewStyles>({
      boldText: {
        fontSize: theme.fonts.large.fontSize,
        margin: "0px",
        padding: 0
      }
    });
  };
