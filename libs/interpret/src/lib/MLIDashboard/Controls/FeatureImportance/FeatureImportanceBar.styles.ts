// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  IStyle,
  mergeStyleSets,
  IProcessedStyleSet
} from "office-ui-fabric-react";

export interface IFeatureImportanceBarStyles {
  featureBarExplanationChart: IStyle;
  topControls: IStyle;
  sliderControl: IStyle;
  sliderLabel: IStyle;
  labelText: IStyle;
  featureSlider: IStyle;
  calloutInfo: IStyle;
}

export const featureImportanceBarStyles: IProcessedStyleSet<IFeatureImportanceBarStyles> = mergeStyleSets<
  IFeatureImportanceBarStyles
>({
  calloutInfo: {
    display: "flex",
    flexDirection: "column",
    fontFamily: `"Segoe UI", "Segoe UI Web (West European)", "Segoe UI",
    -apple-system, BlinkMacSystemFont, Roboto, "Helvetica Neue", sans-serif`,
    maxWidth: "300px",
    padding: "30px"
  },
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
  labelText: {
    fontFamily: `"Segoe UI", "Segoe UI Web (West European)", "Segoe UI",
      -apple-system, BlinkMacSystemFont, Roboto, "Helvetica Neue",
      sans-serif`,
    fontSize: "14px",
    lineHeight: "14px",
    margin: "7px 0 0 4px"
  },
  sliderControl: {
    flex: 1,
    padding: "0 4px"
  },
  sliderLabel: {
    display: "flex",
    flexDirection: "row"
  },
  topControls: {
    display: "flex",
    padding: "3px 15px"
  }
});
