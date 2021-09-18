// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  IStyle,
  mergeStyleSets,
  IProcessedStyleSet
} from "office-ui-fabric-react";

export interface IBeehiveStyles {
  aggregateChart: IStyle;
  topControls: IStyle;
  featureSlider: IStyle;
  pathSelector: IStyle;
  selectorLabel: IStyle;
  sliderControl: IStyle;
  sliderLabel: IStyle;
  labelText: IStyle;
  calloutInfo: IStyle;
  calloutButton: IStyle;
}

export const beehiveStyles: IProcessedStyleSet<IBeehiveStyles> =
  mergeStyleSets<IBeehiveStyles>({
    aggregateChart: {
      display: "flex",
      flexDirection: "column",
      height: "100%",
      width: "100%"
    },
    calloutButton: {
      maxWidth: "100px"
    },
    calloutInfo: {
      display: "flex",
      flexDirection: "column",
      maxWidth: "300px",
      padding: "30px"
    },
    featureSlider: {
      flex: 1
    },
    labelText: {
      fontSize: "14px",
      lineHeight: "14px",
      margin: "7px 0 0 4px"
    },
    pathSelector: {
      margin: "0 5px 0 0"
    },
    selectorLabel: {
      display: "flex",
      flexDirection: "row",
      marginTop: "5px"
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
