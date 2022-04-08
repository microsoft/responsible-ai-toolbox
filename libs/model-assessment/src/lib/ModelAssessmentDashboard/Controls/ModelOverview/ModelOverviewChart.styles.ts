// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  IStyle,
  mergeStyleSets,
  IProcessedStyleSet
} from "office-ui-fabric-react";

export interface IModelOverviewChartStyles {
  rotatedVerticalBox: IStyle;
  horizontalAxis: IStyle;
  verticalAxis: IStyle;
  chart: IStyle;
  placeholderText: IStyle;
}

export const modelOverviewChartStyles: () => IProcessedStyleSet<IModelOverviewChartStyles> =
  () => {
    return mergeStyleSets<IModelOverviewChartStyles>({
      rotatedVerticalBox: {
        marginLeft: "28px",
        position: "absolute",
        textAlign: "center",
        top: "50%",
        transform: "translateX(-50%) translateY(-50%) rotate(270deg)",
        width: "max-content"
      },
      horizontalAxis: {
        textAlign: "center"
      },
      verticalAxis: {
        height: "auto",
        position: "relative",
        top: "0px",
        width: "65px"
      },
      chart: {
        width: "100%"
      },
      placeholderText: {
        marginTop: "15px",
        marginBottom: "15px"
      }
    });
  };
