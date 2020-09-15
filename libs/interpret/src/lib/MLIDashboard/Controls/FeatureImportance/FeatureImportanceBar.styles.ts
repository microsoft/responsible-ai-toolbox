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
  featureBarExplanationChart: {
    width: "100%",
    flex: 1,
    display: "flex",
    flexDirection: "column",
    height: "100%"
  },
  topControls: {
    display: "flex",
    padding: "3px 15px"
  },
  sliderControl: {
    flex: 1,
    padding: "0 4px"
  },
  sliderLabel: {
    display: "flex",
    flexDirection: "row"
  },
  labelText: {
    lineHeight: "14px",
    margin: "7px 0 0 4px",
    fontSize: "14px",
    fontFamily: `"Segoe UI", "Segoe UI Web (West European)", "Segoe UI",
      -apple-system, BlinkMacSystemFont, Roboto, "Helvetica Neue",
      sans-serif`
  },
  featureSlider: {
    flex: 1
  },
  calloutInfo: {
    display: "flex",
    flexDirection: "column",
    maxWidth: "300px",
    padding: "30px",
    fontFamily: `"Segoe UI", "Segoe UI Web (West European)", "Segoe UI",
    -apple-system, BlinkMacSystemFont, Roboto, "Helvetica Neue", sans-serif`
  }
});
