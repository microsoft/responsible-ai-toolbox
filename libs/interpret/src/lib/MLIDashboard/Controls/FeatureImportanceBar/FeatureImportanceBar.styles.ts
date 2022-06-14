// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IStyle, IProcessedStyleSet, mergeStyleSets } from "@fluentui/react";

export interface IFeatureImportanceBarStyles {
  chartWithVertical: IStyle;
  noData: IStyle;
  verticalAxis: IStyle;
  rotatedVerticalBox: IStyle;
  boldText: IStyle;
}

export const featureImportanceBarStyles: IProcessedStyleSet<IFeatureImportanceBarStyles> =
  mergeStyleSets<IFeatureImportanceBarStyles>({
    boldText: {
      fontWeight: "600"
    },
    chartWithVertical: {
      display: "flex",
      flexDirection: "row",
      flexGrow: "1"
    },
    noData: {
      flex: "1",
      margin: "100px auto 0 auto"
    },
    rotatedVerticalBox: {
      marginLeft: "28px",
      position: "absolute",
      textAlign: "center",
      top: "50%",
      transform: "translateX(-50%) translateY(-50%) rotate(270deg)",
      width: "max-content"
    },
    verticalAxis: {
      height: "auto",
      position: "relative",
      top: "0px",
      width: "64px"
    }
  });
