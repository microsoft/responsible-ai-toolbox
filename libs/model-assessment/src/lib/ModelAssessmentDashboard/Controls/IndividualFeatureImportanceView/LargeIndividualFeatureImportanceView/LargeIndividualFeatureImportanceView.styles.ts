// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IStyle, mergeStyleSets, IProcessedStyleSet } from "@fluentui/react";
import { flexLgDown } from "@responsible-ai/core-ui";

export interface ILargeIndividualFeatureImportanceViewStyles {
  chart: IStyle;
  chartWithAxes: IStyle;
  verticalAxis: IStyle;
  rotatedVerticalBox: IStyle;
  chartContainer: IStyle;
  horizontalAxis: IStyle;
  chartWithLegend: IStyle;
}

export const largeIndividualFeatureImportanceViewStyles: () => IProcessedStyleSet<ILargeIndividualFeatureImportanceViewStyles> =
  () => {
    return mergeStyleSets<ILargeIndividualFeatureImportanceViewStyles>({
      chart: {
        marginBottom: "40px",
        width: "80%"
      },
      chartContainer: {
        height: "100%",
        width: "90%"
      },
      chartWithAxes: {
        height: "100%",
        paddingRight: "10px"
      },
      chartWithLegend: flexLgDown,
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
