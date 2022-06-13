// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IStyle, mergeStyleSets, IProcessedStyleSet } from "@fluentui/react";

export interface ISinglePointFeatureImportanceStyles {
  featureBarExplanationChart: IStyle;
  topControls: IStyle;
  featureSlider: IStyle;
  localSummary: IStyle;
}

export const singlePointFeatureImportanceStyles: IProcessedStyleSet<ISinglePointFeatureImportanceStyles> =
  mergeStyleSets<ISinglePointFeatureImportanceStyles>({
    featureBarExplanationChart: {
      display: "flex",
      flex: 1,
      flexDirection: "column",
      height: "100%",
      width: "100%"
    },
    featureSlider: {
      flex: 1
    },
    localSummary: {
      display: "flex",
      flex: 1,
      flexDirection: "column",
      width: "100%"
    },
    topControls: {
      display: "flex",
      padding: "3px 15px"
    }
  });
