// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  IStyle,
  mergeStyleSets,
  IProcessedStyleSet,
  getTheme
} from "office-ui-fabric-react";

export interface IFeatureListStyles {
  featureList: IStyle;
  decisionTree: IStyle;
}

export const featureListStyles: () => IProcessedStyleSet<
  IFeatureListStyles
> = () => {
  const theme = getTheme();
  return mergeStyleSets<IFeatureListStyles>({
    decisionTree: {
      color: "#2d394a",
      fontSize: "18px"
    },
    featureList: {
      backgroundColor: theme.palette.white,
      border: "1px solid #C8C8C8",
      boxSizing: "border-box",
      color: theme.palette.black
    }
  });
};
