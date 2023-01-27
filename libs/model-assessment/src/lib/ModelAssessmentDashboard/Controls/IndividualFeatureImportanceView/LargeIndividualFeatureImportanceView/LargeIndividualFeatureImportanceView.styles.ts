// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IStyle, mergeStyleSets, IProcessedStyleSet } from "@fluentui/react";

export interface ILargeIndividualFeatureImportanceViewStyles {
  chart: IStyle;
  chartWithAxes: IStyle;
  verticalAxis: IStyle;
  rotatedVerticalBox: IStyle;
  chartContainer: IStyle;
  horizontalAxis: IStyle;
  legendContainer: IStyle;
}

export const largeIndividualFeatureImportanceViewStyles: () => IProcessedStyleSet<ILargeIndividualFeatureImportanceViewStyles> =
  () => {
    return mergeStyleSets<ILargeIndividualFeatureImportanceViewStyles>({
      legendContainer: {
        width: "15%"
      },
      chart: {
        marginBottom: "40px",
        width: "90%"
      },
      chartContainer: {
        height: "100%",
        width: "90%"
      },
      chartWithAxes: {
        height: "100%",
        paddingRight: "10px"
      },
      horizontalAxis: {
        textAlign: "center"
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
        width: "65px"
      }
    });
  };
